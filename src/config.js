const fs = require('fs');

function getConfig () {
    const config = getConfigFromEnv();
    let keyFilename;

    if (config.gcloudServiceKey) {
        keyFilename = 'gcloud-service-key.json';
        fs.writeFileSync(`${process.cwd()}/${keyFilename}`, config.gcloudServiceKey);
        delete config.gcloudServiceKey;
    }

    return {
        ...config,
        keyFilename
    };
}

function getConfigFromEnv () {
    const {
        CIRCLECI,
        TRAVIS,
        GCLOUD_SERVICE_KEY: gcloudServiceKey,
        GCS_BUCKET_NAME: gcsBucketName,
        GCS_PROJECT_ID: gcsProjectId
    } = process.env;
    let config

    if (CIRCLECI) {
        config = getConfigFromCircleCiEnv();
    } else if (TRAVIS) {
        config = getConfigFromTravisCiEnv();
    } else {
        config = {}; // should this throw instead?
    }

    return {
        ...config,
        gcsBucketName,
        gcsProjectId,
        gcloudServiceKey,
        artifactsDirectory: `https://console.cloud.google.com/storage/browser/${gcsBucketName}/${config.gcsPrefix}/?project=${gcsProjectId}`
    };
}

function getConfigFromCircleCiEnv () {
    const {
        CIRCLE_BRANCH: branch,
        CIRCLE_BUILD_NUM: buildNumber,
        CIRCLE_BUILD_URL: buildUrl,
        CIRCLE_JOB: job,
        CIRCLE_PROJECT_REPONAME: repo,
        CIRCLE_SHA1: commit,
        PIPELINE_NUMBER: buildId
    } = process.env;

    return {
        branch,
        buildId,
        buildNumber,
        buildUrl,
        commit,
        job,
        repo,
        gcsPrefix: [repo, branch, buildId, job, `build_${buildNumber}`].join('/')
    };
}

function getConfigFromTravisCiEnv () {
    const {
        TRAVIS_BRANCH: branch,
        TRAVIS_BUILD_ID: buildId,
        TRAVIS_BUILD_NUMBER: buildNumber,
        TRAVIS_BUILD_WEB_URL: buildUrl,
        TRAVIS_COMMIT: commit,
        TRAVIS_REPO_SLUG: repo
    } = process.env;

    return {
        branch,
        buildId,
        buildNumber,
        buildUrl,
        commit,
        repo,
        gcsPrefix: [repo, branch, `build_${buildNumber}`, `run_${buildId}`].join('/')
    };
}

module.exports = {
    getConfig,
    getConfigFromEnv,
    getConfigFromCircleCiEnv,
    getConfigFromTravisCiEnv
};
