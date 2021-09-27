module.exports = {
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  globals: {
    'ts-jest': {
      tsconfig: 'test/tsconfig.json',
      diagnostics: {
        ignoreCodes: ['TS151001'],
      },
    },
  },
  moduleDirectories: ['node_modules', 'src', './'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  preset: 'ts-jest',
  setupFiles: ['@testing-library/react/dont-cleanup-after-each'],
  setupFilesAfterEnv: ['<rootDir>/test/__setup__/setupTests.ts'],
  snapshotSerializers: ['jest-serializer-html'],
  testEnvironment: 'jsdom',
  testMatch: null,
  testRegex: '/test/.*?\\.(test|spec)\\.tsx?$',
  testURL: 'http://localhost/',
  verbose: false,
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
