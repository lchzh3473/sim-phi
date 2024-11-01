import pluginJs from '@eslint/js';
import StylisticPlugin from '@stylistic/eslint-plugin';
import CustomPlugin from './custom-rules-plugin.mjs';
import tseslint from 'typescript-eslint';
/** @type {import('eslint').Linter.RulesRecord} */
const stylRules = {
  ...StylisticPlugin.configs['all-flat'].rules,
  '@stylistic/array-element-newline': ['error', 'consistent'],
  '@stylistic/arrow-parens': ['error', 'as-needed'],
  '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
  '@stylistic/function-call-argument-newline': ['error', 'consistent'],
  '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
  '@stylistic/lines-around-comment': ['error', { beforeBlockComment: false }],
  '@stylistic/lines-between-class-members': ['error', 'never'],
  '@stylistic/max-len': 'off',
  '@stylistic/max-statements-per-line': 'off', // qwq
  '@stylistic/multiline-comment-style': 'off', // qwq
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
  '@stylistic/wrap-regex': 'off' // someday will be never
};
/** @type {import('eslint').Linter.RulesRecord} */
const jsRules = {
  ...stylRules,
  ...pluginJs.configs.all.rules,
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
  'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^ignore' }],
  'no-use-before-define': ['error', 'nofunc'],
  'no-warning-comments': 'warn', // qwq
  'one-var': ['error', { initialized: 'never', uninitialized: 'always' }],
  'prefer-const': ['error', { destructuring: 'all' }],
  'prefer-destructuring': ['error', { object: true, array: false }],
  'prefer-named-capture-group': 'off', // ?
  'radix': ['error', 'as-needed'],
  'require-atomic-updates': ['error', { allowProperties: true }],
  'require-unicode-regexp': 'off', // ?
  '@custom/no-magic-words': ['error', { words: ['lchz\\x68', 'Phi\\x67ros', 'sim\\x70hi', 'f\\x75ck'] }],
  '@custom/no-single-line-braces': 'error',
  '@custom/single-line-spacing': 'error',
  '@custom/space-before-inline-comments': 'error',
  'sort-imports': ['error', { ignoreDeclarationSort: true }],
  'sort-keys': 'off' // someday will be never
};
/** @type {import('eslint').Linter.RulesRecord} */
const tsRules = {
  ...jsRules,
  ...Object.assign({}, ...tseslint.configs.all.map(item => item.rules)),
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
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^ignore' }],
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
  'one-var': ['error', 'never'], // qwq
  'require-await': 'off' // qwq
};
/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    plugins: {
      '@stylistic': StylisticPlugin,
      '@custom': CustomPlugin,
      '@typescript-eslint': tseslint.plugin
    }
  },
  {
    files: ['**/*.{js,jsx,cjs,mjs}'],
    rules: jsRules
  },
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
    languageOptions: {
      parser: tseslint.parser
    },
    rules: tsRules
  }
];
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
