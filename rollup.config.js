import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const input = 'src/index.js'
const globalName = 'Kapellmeister'

const umd = [
  {
    input,
    output: {
      file: `build/dist/${pkg.name}.js`,
      format: 'umd',
      exports: 'named',
      name: globalName,
    },
    plugins: [
      babel({
        runtimeHelpers: true,
        exclude: 'node_modules/**',
        extensions: ['.js'],
        presets: [],
        plugins: [
          '@babel/plugin-proposal-class-properties',
          '@babel/transform-runtime',
        ],
      }),
      nodeResolve({
        extensions: ['.ts']
      }),
      commonjs({
        include: /node_modules/,
      }),
      replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
      sizeSnapshot(),
    ],
  },
  {
    input,
    output: {
      file: `build/dist/${pkg.name}.min.js`,
      format: 'umd',
      exports: 'named',
      name: globalName,
    },
    plugins: [
      babel({
        runtimeHelpers: true,
        exclude: 'node_modules/**',
        extensions: ['.js'],
        presets: [],
        plugins: [
          '@babel/plugin-proposal-class-properties',
          '@babel/transform-runtime',
        ],
      }),
      nodeResolve({
        extensions: ['.ts']
      }),
      commonjs({
        include: /node_modules/,
      }),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      terser(),
      sizeSnapshot(),
    ],
  },
]

export default umd
