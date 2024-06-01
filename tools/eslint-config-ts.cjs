'use strict';
module.exports = {
  extends: [
    'plugin:@typescript-eslint/all',
    './eslint-config.cjs'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: 'tsconfig.json'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/ban-ts-comment': ['error', { 'ts-nocheck': 'allow-with-description' }],
    '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    // '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
    '@typescript-eslint/max-params': 'off',
    '@typescript-eslint/member-ordering': ['error', { default: memberOrdering() }],
    '@typescript-eslint/naming-convention': ['error', ...defaultNamingConvention(), { selector: 'import', format: null }],
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true, ignoreRestArgs: true }],
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-invalid-void-type': ['error', { allowAsThisParameter: true }],
    '@typescript-eslint/no-magic-numbers': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-type-alias': 'off',
    // '@typescript-eslint/no-unnecessary-condition': 'off', // qwq
    // '@typescript-eslint/no-unsafe-call': 'off', // qwq
    // '@typescript-eslint/no-unsafe-member-access': 'off', // qwq
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
    '@typescript-eslint/prefer-destructuring': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    '@typescript-eslint/prefer-optional-chain': ['error', { requireNullish: true }],
    'default-param-last': 'off', // qwq
    'no-invalid-this': 'off', // qwq
    'no-redeclare': 'off', // qwq
    'no-shadow': 'off', // qwq
    'no-undef': 'off', // qwq
    'no-use-before-define': 'off', // qwq
    'require-await': 'off' // qwq
  }
};
function memberOrdering() {
  return [
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
  ];
}
function defaultNamingConvention() {
  return [
    {
      selector: 'default',
      format: ['camelCase'],
      leadingUnderscore: 'allow',
      trailingUnderscore: 'allow'
    },
    {
      selector: 'variable',
      format: ['camelCase', 'UPPER_CASE'],
      leadingUnderscore: 'allow',
      trailingUnderscore: 'allow'
    },
    {
      selector: 'typeLike',
      format: ['PascalCase']
    }
  ];
}
