'use strict';
module.exports = {
  extends: ['eslint:all'],
  plugins: ['rulesdir'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: 'tsconfig.json'
  },
  rules: {
    'array-element-newline': ['error', 'consistent'],
    'arrow-parens': ['error', 'as-needed'],
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'camelcase': ['error', { properties: 'never' }],
    'capitalized-comments': 'off',
    'complexity': 'off', // qwq
    'curly': ['error', 'multi-line'],
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'func-names': ['error', 'never'],
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'function-call-argument-newline': ['error', 'never'],
    'grouped-accessor-pairs': ['error', 'getBeforeSet'],
    'id-length': 'off',
    'indent': ['error', 2, { SwitchCase: 1 }],
    'init-declarations': 'off',
    'line-comment-position': 'off',
    'lines-around-comment': ['error', { beforeBlockComment: false }],
    'lines-between-class-members': ['error', 'never'],
    'max-classes-per-file': 'off',
    'max-depth': 'off', // qwq
    'max-len': 'off',
    'max-lines-per-function': 'off', // ?
    'max-lines': 'off',
    'max-params': 'off', // qwq
    'max-statements-per-line': 'off', // qwq
    'max-statements': 'off', // qwq
    'multiline-comment-style': ['error', 'separate-lines'],
    'multiline-ternary': ['error', 'never'],
    'newline-per-chained-call': 'off', // qwq
    'no-await-in-loop': 'off',
    'no-bitwise': 'off',
    'no-confusing-arrow': 'off', // qwq
    'no-console': 'off', // qwq
    'no-continue': 'off', // qwq
    'no-control-regex': 'off',
    'no-empty-function': 'off',
    'no-eq-null': 'off',
    'no-inline-comments': 'off',
    'no-magic-numbers': 'off', // qwq
    'no-mixed-operators': 'off', // qwq
    'no-multiple-empty-lines': ['error', { max: 0 }],
    'no-nested-ternary': 'off',
    'no-plusplus': 'off',
    'no-return-assign': 'off',
    'no-self-assign': ['error', { props: false }],
    'no-ternary': 'off',
    'no-undefined': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-use-before-define': ['error', 'nofunc'],
    'no-warning-comments': 'warn', // qwq
    'object-curly-spacing': ['error', 'always'],
    'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
    'one-var': ['error', { initialized: 'never', uninitialized: 'always' }],
    'padded-blocks': ['error', 'never'],
    'prefer-const': ['error', { destructuring: 'all' }],
    'prefer-destructuring': ['error', { object: true, array: false }],
    'prefer-named-capture-group': 'off', // ?
    'quote-props': ['error', 'consistent-as-needed'],
    'quotes': ['error', 'single'],
    'require-atomic-updates': ['error', { allowProperties: true }],
    'require-unicode-regexp': 'off', // ?
    'semi': ['error', 'always', { omitLastInOneLineBlock: true }],
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    'sort-keys': 'off',
    'space-before-function-paren': ['error', 'never'],
    'spaced-comment': ['error', 'always', { block: { balanced: true } }],
    'rulesdir/space-before-inline-comments': 'error',
    'rulesdir/no-magic-words': ['error', { words: ['lchz\\x68', 'Phi\\x67ros', 'sim\\x70hi', 'f\\x75ck'] }],
    'rulesdir/single-line-control-statement-spacing': 'error',
    'wrap-regex': 'off' // someday will be never
  }
};
