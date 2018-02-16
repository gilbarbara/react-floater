import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'es/index.js',
    format: 'es',
  },
  external: [
    'deepmerge',
    'exenv',
    'is-plain-obj',
    'popper.js',
    'prop-types',
    'react',
    'react-dom',
    'react-proptype-conditional-require',
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    commonjs(),
  ]
};
