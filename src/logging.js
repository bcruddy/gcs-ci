function info (...msg) {
    console.log(...msg);
}

function error (...msg) {
    console.error(...msg);
}

module.exports = {
    error,
    info
};
