import path from 'path'
import { fileURLToPath } from 'url'
import terser from '@rollup/plugin-terser'
import filesize from 'rollup-plugin-filesize'
import typescript from '@rollup/plugin-typescript'

import pkg from './package.json'
// eslint need babel-parser to resolve "with" syntax
// import pkg from './package.json' with { type: "json" };

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const inputPath = path.join(__dirname, 'src', 'index.ts')
const outputDir = path.join(__dirname, 'dist')

const testFileMatchers = [
  // exclude test files
  '**/__tests__/**',
  '**/*.test.*',
  '**/*.spec.*',
]

const deps = [...Object.keys(pkg.peerDependencies || {}), ...Object.keys(pkg.dependencies || {})]

const external = (id) => deps.includes(id) || /@babel\/runtime\//.test(id)

const generateDevOutputs = () => [
  {
    file: path.join(outputDir, 'rrnl-request-limiter-middleware.js'),
    format: 'cjs',
  },
  {
    file: path.join(outputDir, 'rrnl-request-limiter-middleware.mjs'),
    format: 'es',
  },
  {
    file: path.join(outputDir, 'rrnl-request-limiter-middleware.cjs'),
    format: 'cjs',
  },
]

const generateProdOutputs = () => {
  const plugins = [terser()]
  return [
    {
      file: path.join(outputDir, 'rrnl-request-limiter-middleware.min.js'),
      format: 'cjs',
      plugins,
    },
    {
      file: path.join(outputDir, 'rrnl-request-limiter-middleware.min.mjs'),
      format: 'es',
      plugins,
    },
    {
      file: path.join(outputDir, 'rrnl-request-limiter-middleware.min.cjs'),
      format: 'cjs',
      plugins,
    },
    {
      file: path.join(outputDir, 'rrnl-request-limiter-middleware.browser.js'),
      name: 'createRRNLRequestLimiterMiddleware',
      format: 'umd',
      plugins,
    },
  ]
}

export default {
  input: inputPath,
  external,
  plugins: [
    typescript({
      exclude: testFileMatchers,
      compilerOptions: {
        declaration: true,
        declarationDir: path.join(outputDir, 'types'),
      },
    }),
    filesize(),
  ],
  output: [
    ...generateDevOutputs(),
    ...generateProdOutputs(),
  ],
}
