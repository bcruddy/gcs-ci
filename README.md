# gcs-ci

An npm module to simplify writing build artifacts to gcs from your CI environment

## CI support

CircleCI and TravisCI are currently the only supported platforms, feel free to open a pull request to add another

## setup

`gcs-ci` will automatically detected your CI environmennt and pull in the necessary environmennt variables to deploy to GCS.

You'll need to provide the following:

* `GCS_PROJECT_ID`
* `GCS_BUCKET_NAME`
* `GCLOUD_SERVICE_KEY` - if you env has already authorized `gcloud` this isn't required
* `PIPELINE_NUMBER` - this is required only for circle CI and can be passed via:
    * `PIPELINE_NUMBER=<< pipeline.number >> npm run <gcs-ui command>`

`gcs-ci` leverages your CI service's environment variables to build a reasonable file prefix as well as includes a manifest describing the job the artifacts were generated from. They're pushed to the GCS bucket provided above. Depending on your platform, artifacts will be stored with the prefix:

* circleci
    * `<bucket>/<repo>/<branch>/<pipeline number>/<job>/build_<build number>`
* travisci
    * `<bucket>/<repo>/<branch>/build_<build number>/run_<build id>`

## usage

Based on the config provided in setup, the only function call you need points `gcs-ci` at the directory you wish to uplaod.

js:
```javascript
const gcsCi = require('gcs-ci');

gcsCi.writeToGcs('path/to/artifacts')
    .then(() => console.log('success!'))
    .catch((err) => console.error(err));
```
npm script:

```
"write-artifacts": "node -e \"require('gcs-ci').writeToGcs('path/to/artifacts')\""
```

for more information about setup and config, see `src/config.js`
