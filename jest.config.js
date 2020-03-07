module.exports = {
    moduleFileExtensions: ['js', 'json'],
    testURL: 'http://localhost/',
    testMatch: ['<rootDir>/tests/*spec.js'],
    collectCoverage: true,
    collectCoverageFrom: [
        '<rootDir>/src/*.js'
    ]
};
