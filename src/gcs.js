const fs = require('fs');
const { Readable } = require('stream');
const { promisify } = require('util');
const { Storage } = require('@google-cloud/storage');
const { getConfig } = require('./config');
const { UPLOAD_IGNORE } = require('./constants');
const logging = require('./logging')
const { getContentType } = require('./utils');

const readdir = promisify(fs.readdir);

async function writeToGcs (localpath) {
    const config = getConfig();
    const gcs = new Storage({
        keyFilename: config.keyFilename,
        projectId: config.gcsProjectId
    });
    const bucket = gcs.bucket(config.gcsBucketName);

    try {
        const files = await writeArtifacts(localpath, config, bucket);
        const manifest = await writeManifest(config, bucket);

        logging.info(`artifacts written to GCS`, config.artifactsDirectory);

        return { manifest, files };
    } catch (ex) {
        logging.error(ex.toString());
    }
}

async function writeManifest (config, bucket) {
    const manifestpath = `${config.gcsPrefix}/manifest.json`;
    const gcsManifestFile = bucket.file(manifestpath);
    const writeStreamOptions = {
        contentType: 'application/json',
        gzip: true,
        resumable: false,
        metadata: {
            cacheControl: 'no-cache'
        }
    };
    const { branch, buildUrl, repo, job = '<undefined>' } = config;

    return new Promise((resolve, reject) => {
        const readable = new Readable();
        const manifest = {
            buildUrl,
            branch,
            job,
            repo,
            timestamp: Date.now()
        };

        readable.push(JSON.stringify(manifest));
        readable.push(null);

        readable
            .pipe(gcsManifestFile.createWriteStream(writeStreamOptions))
            .on('error', reject)
            .on('finish', () => resolve({ manifest, manifestpath }));
    });
}

async function writeArtifacts (localpath, config, bucket, filenamePrefix = '') {
    const files = await readdir(localpath);
    const uploads = files
        .filter((filename) => !UPLOAD_IGNORE[filename])
        .map((filename) => {
            const localfilepath = [localpath, filename].filter(Boolean).join('/');
            const stat = fs.statSync(localfilepath);

            if (stat.isDirectory()) {
                const prefix = [filenamePrefix, filename].filter(Boolean).join('/');
                return writeArtifacts(localfilepath, config, bucket, prefix);
            }

            const contentType = getContentType(filename);
            const writeStreamOptions = {
                contentType,
                gzip: true,
                resumable: false,
                metadata: {
                    cacheControl: 'no-cache'
                }
            };
            const gcsFilepath = [config.gcsPrefix, filenamePrefix, filename].join('/');
            const gcsFile = bucket.file(gcsFilepath);

            return new Promise((resolve, reject) => {
                fs.createReadStream(localfilepath)
                    .pipe(gcsFile.createWriteStream(writeStreamOptions))
                    .on('error', reject)
                    .on('finish', () => resolve(files));
            });
        });

    return Promise.all(uploads);
}

module.exports = {
    writeToGcs,
    writeManifest,
    writeArtifacts
};
