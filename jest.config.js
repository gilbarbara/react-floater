module.exports = {
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  moduleDirectories: ['node_modules', 'src', './'],
  moduleNameMapper: {
    '^.+\\.(css|scss)$': '<rootDir>/test/__setup__/styleMock.js',
    '^.+\\.(jpe?g|png|gif|ttf|eot|svg|md)$': '<rootDir>/test/__setup__/fileMock.js',
  },
  setupFiles: ['<rootDir>/test/__setup__/setupFiles.js'],
  setupFilesAfterEnv: ['<rootDir>/test/__setup__/setupTests.js'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  testEnvironmentOptions: { resources: 'usable' },
  testRegex: '/test/.*?\\.(test|spec)\\.js$',
  testURL: 'http://localhost:3000',
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.js'],
  coverageThreshold: {
    global: {
      branches: 55,
      functions: 75,
      lines: 65,
      statements: 65,
    },
  },
  verbose: false,
};
