'use strict';
module.exports = {
  extends: [
    'eslint:all',
    'plugin:@stylistic/disable-legacy',
    'plugin:@stylistic/all-extends'
  ],
  plugins: ['@stylistic', 'rulesdir'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: 'tsconfig.json'
  },
  rules: {
    '@stylistic/array-element-newline': ['error', 'consistent'],
    '@stylistic/arrow-parens': ['error', 'as-needed'],
    '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    '@stylistic/function-call-argument-newline': ['error', 'consistent'],
    '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
    '@stylistic/lines-around-comment': ['error', { beforeBlockComment: false }],
    '@stylistic/lines-between-class-members': ['error', 'never'],
    '@stylistic/max-len': 'off',
    '@stylistic/max-statements-per-line': 'off', // qwq
    '@stylistic/multiline-ternary': ['error', 'never'],
    '@stylistic/newline-per-chained-call': 'off', // qwq
    '@stylistic/no-confusing-arrow': 'off', // qwq
    '@stylistic/no-extra-parens': ['error', 'all'],
    '@stylistic/no-mixed-operators': 'off', // qwq
    '@stylistic/no-multiple-empty-lines': ['error', { max: 0 }],
    '@stylistic/object-curly-spacing': ['error', 'always'],
    '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
    '@stylistic/padded-blocks': ['error', 'never'],
    '@stylistic/quote-props': ['error', 'consistent-as-needed'],
    '@stylistic/quotes': ['error', 'single'],
    '@stylistic/semi': ['error', 'always', { omitLastInOneLineBlock: true }],
    '@stylistic/space-before-function-paren': ['error', 'never'],
    '@stylistic/spaced-comment': ['error', 'always', { block: { balanced: true } }],
    '@stylistic/wrap-regex': 'off', // someday will be never
    'camelcase': ['error', { properties: 'never' }],
    'capitalized-comments': 'off',
    'complexity': 'off', // qwq
    'curly': ['error', 'multi-line'],
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'func-names': ['error', 'never'],
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'grouped-accessor-pairs': ['error', 'getBeforeSet'],
    'id-length': 'off',
    'init-declarations': 'off',
    'line-comment-position': 'off',
    'max-classes-per-file': 'off',
    'max-depth': 'off', // qwq
    'max-lines-per-function': 'off',
    'max-lines': 'off',
    'max-params': 'off', // qwq
    'max-statements': 'off', // qwq
    'multiline-comment-style': ['error', 'separate-lines'],
    'no-await-in-loop': 'off',
    'no-bitwise': 'off',
    'no-console': 'off', // qwq
    'no-continue': 'off', // qwq
    'no-control-regex': 'off',
    'no-empty-function': 'off',
    'no-eq-null': 'off',
    'no-inline-comments': 'off',
    'no-magic-numbers': 'off', // qwq
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
    'one-var': ['error', { initialized: 'never', uninitialized: 'always' }],
    'prefer-const': ['error', { destructuring: 'all' }],
    'prefer-destructuring': ['error', { object: true, array: false }],
    'prefer-named-capture-group': 'off', // ?
    'radix': ['error', 'as-needed'],
    'require-atomic-updates': ['error', { allowProperties: true }],
    'require-unicode-regexp': 'off', // ?
    'rulesdir/no-magic-words': ['error', { words: ['lchz\\x68', 'Phi\\x67ros', 'sim\\x70hi', 'f\\x75ck'] }],
    'rulesdir/no-single-line-braces': 'error',
    'rulesdir/single-line-spacing': 'error',
    'rulesdir/space-before-inline-comments': 'error',
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    'sort-keys': 'off' // someday will be never
  }
};
