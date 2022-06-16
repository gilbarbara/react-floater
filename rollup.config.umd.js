import resolve from '@rollup/plugin-node-resolve';
import packageJSON from './package.json';
import baseConfig from './rollup.config';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'lib/index.umd.js',
      format: 'umd',
      name: 'Floater',
      intro: 'var global = typeof self !== undefined ? self : this;',
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
