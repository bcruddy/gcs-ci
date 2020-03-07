const { last } = require('lodash');
const { CONTENT_TYPE_MAP } = require('./constants');

function getContentType (filename) {
    const ext = last(filename.split('.'));

    return CONTENT_TYPE_MAP[ext];
}

module.exports = {
    getContentType
};
