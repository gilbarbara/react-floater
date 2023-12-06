import resolve from '@rollup/plugin-node-resolve';
import packageJSON from './package.json' assert { type: 'json' };
import baseConfig from './rollup.config.mjs';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'lib/index.umd.js',
      format: 'umd',
      name: 'Floater',
      globals: {
        react: 'React',
        'prop-types': 'PropTypes',
        'react-dom': 'ReactDOM',
      },
    },
  ],
  external: [...Object.keys(packageJSON.peerDependencies)],
  plugins: [...baseConfig.plugins, resolve()],
};
