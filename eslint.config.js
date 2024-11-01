import globals from 'globals';
import eslintConfigv2 from './tools/eslint-config.mjs';
/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['**/* copy.*', 'dist', 'rubbish']
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  ...eslintConfigv2,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.worker,
        ...globals.node,
        hook: 'writable',
        Utils: 'readonly'
      }
    }
  }
];
