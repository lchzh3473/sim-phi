import noMagicWords from './eslint-rules/no-magic-words.cjs';
import noSingleLineBraces from './eslint-rules/no-single-line-braces.cjs';
import singleLineSpacing from './eslint-rules/single-line-spacing.cjs';
import spaceBeforeInlineComments from './eslint-rules/space-before-inline-comments.cjs';
/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: {
    name: 'eslint-plugin-custom-rules',
    version: '1.0.0'
  },
  rules: {
    'no-magic-words': noMagicWords,
    'no-single-line-braces': noSingleLineBraces,
    'single-line-spacing': singleLineSpacing,
    'space-before-inline-comments': spaceBeforeInlineComments
  }
};
// for ESM
export default plugin;
