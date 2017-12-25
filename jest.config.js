module.exports = {
  transform: {
    '.*': 'babel-jest',
  },
  moduleFileExtensions: [
    'js',
    'json',
  ],
  moduleDirectories: [
    'node_modules',
    'src',
    './',
  ],
  setupFiles: [
    '<rootDir>/test/__setup__/shim.js',
    '<rootDir>/test/__setup__/index.js',
  ],
  setupTestFrameworkScriptFile: 'jest-enzyme/lib/index.js',
  testEnvironmentOptions: { pretendToBeVisual: true },
  testRegex: '/test/.*?\\.(test|spec)\\.js$',
  testURL: 'http://localhost:3000',
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.js',
  ],
  coverageThreshold: {
    global: {
      branches: 55,
      functions: 75,
      lines: 65,
      statements: 65
    },
  },
  verbose: true,
};
