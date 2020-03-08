const USER_ENV = () => ({
    GCLOUD_SERVICE_KEY: '{ "foo": "bar" }',
    GCS_BUCKET_NAME: 'bucket-1',
    GCS_PROJECT_ID: 'project-1'
});
const CI_ENV = {
    circleci: () => ({
        CIRCLE_BRANCH: 'foo-1',
        CIRCLE_BUILD_NUM: '123',
        CIRCLE_BUILD_URL: 'https://circleci.com/fake/url',
        CIRCLE_JOB: 'e2e-tests',
        CIRCLE_PROJECT_REPONAME: 'mayhem',
        PIPELINE_NUMBER: '4567',
        ...USER_ENV()
    }),
    travisci: () => ({
        TRAVIS_BRANCH: 'foo-1',
        TRAVIS_BUILD_ID: '4567',
        TRAVIS_BUILD_NUMBER: '123',
        TRAVIS_BUILD_WEB_URL: 'https://travis-ci.org/fake/url',
        TRAVIS_REPO_SLUG: 'mayhem',
        ...USER_ENV()
    })
};

function setup (name) {
    const env = CI_ENV[name];

    if (!env) {
        throw new Error(`env "${name}" not found.`);
    }

    if (name === 'circleci') {
        process.env.CIRCLECI = true;
    }

    if (name === 'travisci') {
        process.env.TRAVIS = true;
    }

    Object.entries(env()).forEach(([key, value]) => {
        process.env[key] = value;
    });
}

function teardown () {
    const envNames = ['circleci', 'travisci'];

    envNames.forEach((name) => {
        const env = CI_ENV[name]();

        Object.keys(env).concat('CIRCLECI', 'TRAVIS').forEach((key) => {
            delete process.env[key];
        });
    });
}

module.exports = {
    setup,
    teardown
};
