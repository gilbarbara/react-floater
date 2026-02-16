import config from '@gilbarbara/eslint-config';
import testingLibrary from '@gilbarbara/eslint-config/testing-library';
import vitest from '@gilbarbara/eslint-config/vitest';

export default [
  ...config,
  ...vitest,
  ...testingLibrary,
  {
    files: ['test/**'],
    rules: {
      'no-console': 'off',
      'testing-library/no-node-access': 'off',
    },
  },
];
