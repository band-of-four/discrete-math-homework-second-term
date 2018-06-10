import buble from 'rollup-plugin-buble';
import when from 'rollup-plugin-conditional';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';

const production = process.env.NODE_ENV === "production",
      development = !production;

export default {
  input: 'src/app.js',
  output: {
    file: '../dist/app.js',
    format: 'iife',
    sourcemap: (development ? 'inline' : false)
  },
  plugins: [
    buble({ jsx: 'h' }),
    resolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      sourceMap: false
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    when(production, [
      uglify()
    ])
  ]
};
