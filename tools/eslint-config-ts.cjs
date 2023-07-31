'use strict';
module.exports = {
  extends: ['plugin:@typescript-eslint/all'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: 'tsconfig.json'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/ban-ts-comment': ['error', { 'ts-nocheck': 'allow-with-description' }],
    '@typescript-eslint/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
    '@typescript-eslint/explicit-function-return-type': 'off', // qwq
    '@typescript-eslint/indent': ['error', 2, { SwitchCase: 1 }],
    '@typescript-eslint/lines-around-comment': ['error', { beforeBlockComment: false }],
    '@typescript-eslint/lines-between-class-members': ['error', 'never'],
    '@typescript-eslint/no-confusing-void-expression': 'off', // qwq
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true, ignoreRestArgs: true }],
    '@typescript-eslint/no-extra-parens': ['error', 'all', { returnAssign: false }],
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-magic-numbers': 'off', // qwq
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off', // qwq
    '@typescript-eslint/no-type-alias': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off', // qwq
    '@typescript-eslint/no-unsafe-call': 'off', // qwq
    '@typescript-eslint/no-unsafe-member-access': 'off', // qwq
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
    '@typescript-eslint/object-curly-spacing': ['error', 'always'],
    '@typescript-eslint/prefer-nullish-coalescing': 'off', // qwq
    '@typescript-eslint/prefer-readonly-parameter-types': 'off', // qwq
    '@typescript-eslint/quotes': ['error', 'single'],
    '@typescript-eslint/semi': ['error', 'always', { omitLastInOneLineBlock: true }],
    '@typescript-eslint/space-before-function-paren': ['error', 'never'],
    '@typescript-eslint/member-ordering': [
      'error',
      {
        default: [
          // Index signature
          'signature',
          'call-signature',
          // Fields
          'static-field',
          'instance-field',
          'abstract-field',
          'decorated-field',
          'field',
          // Static initialization
          'static-initialization',
          // Constructors
          'constructor',
          // Getters and setters
          ['static-get', 'static-set'],
          ['instance-get', 'instance-set'],
          ['abstract-get', 'abstract-set'],
          ['decorated-get', 'decorated-set'],
          ['get', 'set'],
          // Methods
          'static-method',
          'instance-method',
          'abstract-method',
          'decorated-method',
          'method'
        ]
      }
    ]
  }
};
