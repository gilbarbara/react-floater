import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'es/index.js',
    format: 'es',
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    commonjs(),
  ]
};
