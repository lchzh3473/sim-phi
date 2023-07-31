'use strict';
const rulesDirPlugin = require('eslint-plugin-rulesdir');
rulesDirPlugin.RULES_DIR = 'tools/eslint-rules';
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    worker: true,
    node: true
  },
  extends: ['./tools/eslint-config.cjs'],
  overrides: [
    {
      files: ['./**/*.cjs'],
      parserOptions: {
        sourceType: 'script'
      },
      rules: {
        strict: ['error', 'global']
      }
    }, {
      files: ['./**/*.{ts,tsx}'],
      extends: ['./tools/eslint-config-ts.cjs']
    }
  ],
  globals: {
    hook: 'writable',
    Utils: 'readonly'
  },
  ignorePatterns: ['* copy.*']
};
