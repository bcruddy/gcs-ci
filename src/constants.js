// best way to extend this?
const CONTENT_TYPE_MAP = {
    png: 'image/png',
    jpg: 'image/jpg',
    mp4: 'video/mp4',
    json: 'application/json',
    xml: 'application/xml'
};

// allow a .gcsciignore file to extend this?
const UPLOAD_IGNORE = {
    '.DS_Store': true
};

module.exports = {
    CONTENT_TYPE_MAP,
    UPLOAD_IGNORE
};
