import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import packageJSON from './package.json';

const plugins = () => [
  babel({
    exclude: 'node_modules/**',
  }),
  commonjs(),
];

export default {
  input: 'src/index.js',
  output: [{ file: 'lib/index.js', format: 'cjs' }, { file: 'es/index.js', format: 'es' }],
  external: [
    ...Object.keys(packageJSON.peerDependencies),
    ...Object.keys(packageJSON.dependencies),
  ],
  plugins: [...plugins()],
};
