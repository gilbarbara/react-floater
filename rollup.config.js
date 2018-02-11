import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'es/index.js',
    format: 'es',
  },
  external: ['react', 'react-dom', 'prop-types', 'popper.js', 'deepmerge', 'exenv', 'react-proptype-conditional-require'],
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    commonjs(),
  ]
};
