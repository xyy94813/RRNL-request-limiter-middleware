module.exports = {
  extends: 'standard',
  ignorePatterns: [
    'node_modules/**/*', // output dir
    'dist/**/*', // output dir
    '.yarn/**/*', // yarn dir
    '.pnp.*', // yarn pnp files
  ],
  overrides: [
    {
      files: ['src/**/*'],
      extends: 'standard-with-typescript',
      env: {
        browser: true,
        es2021: true,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    {
      // config files
      files: [
        '.eslintrc.{js,cjs}',
        './commitlint.config.js',
      ],
      env: {
        node: true,
      },
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      // for es-module config js
      files: [
        './.lintstagedrc.mjs',
        './rollup.config.mjs',
      ],
      env: {
        node: true,
      },
      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
  },
}