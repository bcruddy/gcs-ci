const fs = require('fs');
const config = require('../src/config');
const envUtils = require('./env-utils');

jest.mock('fs', () =>({
    writeFileSync: jest.fn()
}));

describe('getConfig', () => {
    beforeEach(() => {
        process.env.CIRCLE = true;
        envUtils.setup('circleci');
    });

    afterEach(() => {
        envUtils.teardown();
    });

    it('returns a valid config object', () => {
        const c = config.getConfig();

        expect(c).toEqual({
            artifactsDirectory: 'https://console.cloud.google.com/storage/browser/bucket-1/mayhem/foo-1/4567/e2e-tests/build_123/?project=project-1',
            branch: 'foo-1',
            buildId: '4567',
            buildNumber: '123',
            buildUrl: 'https://circleci.com/fake/url',
            gcsBucketName: 'bucket-1',
            gcsPrefix: 'mayhem/foo-1/4567/e2e-tests/build_123',
            gcsProjectId: 'project-1',
            keyFilename: 'gcloud-service-key.json',
            job: 'e2e-tests',
            repo: 'mayhem'
        })
    });

    it('writes a service key file when `gcloudServiceKey` exists', () => {
        config.getConfig();

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining('/gcloud-service-key.json'),
            expect.any(String)
        )
    });
});

describe('getConfigFromEnv', () => {
    beforeEach(() => {
        envUtils.teardown();
    });

    it('returns a valid config object for circleci', () => {
        envUtils.setup('circleci');
        const envConfig = config.getConfigFromEnv();

        expect(envConfig).toEqual({
            artifactsDirectory: 'https://console.cloud.google.com/storage/browser/bucket-1/mayhem/foo-1/4567/e2e-tests/build_123/?project=project-1',
            branch: 'foo-1',
            buildId: '4567',
            buildNumber: '123',
            buildUrl: 'https://circleci.com/fake/url',
            gcloudServiceKey: expect.any(String),
            gcsBucketName: 'bucket-1',
            gcsPrefix: 'mayhem/foo-1/4567/e2e-tests/build_123',
            gcsProjectId: 'project-1',
            job: 'e2e-tests',
            repo: 'mayhem'
        });
    });

    it('returns a valid config object for travis', () => {
        envUtils.setup('travisci');
        const envConfig = config.getConfigFromEnv();

        expect(envConfig).toEqual({
            artifactsDirectory: 'https://console.cloud.google.com/storage/browser/bucket-1/mayhem/foo-1/build_123/run_4567/?project=project-1',
            branch: 'foo-1',
            buildId: '4567',
            buildNumber: '123',
            buildUrl: 'https://travis-ci.org/fake/url',
            gcloudServiceKey: expect.any(String),
            gcsBucketName: 'bucket-1',
            gcsPrefix: 'mayhem/foo-1/build_123/run_4567',
            gcsProjectId: 'project-1',
            repo: 'mayhem'
        });
    });
});

describe('getConfigFromCircleCiEnv', () => {
    beforeEach(() => {
        envUtils.setup('circleci');
    });

    afterEach(() => {
        envUtils.teardown();
    });

    it('returns a valid config object from circle ci env variables', () => {
        const envConfig = config.getConfigFromCircleCiEnv();

        expect(envConfig).toEqual({
            branch: 'foo-1',
            buildId: '4567',
            buildNumber: '123',
            buildUrl: 'https://circleci.com/fake/url',
            job: 'e2e-tests',
            repo: 'mayhem',
            gcsPrefix: 'mayhem/foo-1/4567/e2e-tests/build_123'
        });
    });
});

describe('getConfigFromTravisCiEnv', () => {
    beforeEach(() => {
        envUtils.setup('travisci');
    });

    afterEach(() => {
        envUtils.teardown();
    });

    it('returns a valid config object from travis ci env variables', () => {
        const envConfig = config.getConfigFromTravisCiEnv();

        expect(envConfig).toEqual({
            branch: 'foo-1',
            buildId: '4567',
            buildNumber: '123',
            buildUrl: 'https://travis-ci.org/fake/url',
            repo: 'mayhem',
            gcsPrefix: 'mayhem/foo-1/build_123/run_4567'
        });
    });
});
