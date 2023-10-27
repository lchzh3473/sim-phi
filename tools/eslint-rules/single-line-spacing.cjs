'use strict';
/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforces consistent spacing in single-line control statements.'
    },
    fixable: 'whitespace'
  },
  create(context) {
    const { sourceCode } = context;
    return {
      ExpressionStatement(node) {
        const prevToken = sourceCode.getTokenBefore(node, { includeComments: true });
        if (prevToken && prevToken.loc.end.column === node.loc.start.column) {
          context.report({
            node,
            loc: node.loc,
            message: 'Expected space before expression statement.',
            fix(fixer) { return fixer.insertTextBefore(node, ' ') }
          });
        }
      },
      EmptyStatement(node) {
        const prevToken = sourceCode.getTokenBefore(node, { includeComments: true });
        if (prevToken && prevToken.loc.end.column !== node.loc.start.column) {
          context.report({
            node,
            loc: node.loc,
            message: 'Unexpected space before empty statement.',
            fix(fixer) { return fixer.removeRange([prevToken.range[1], node.range[0]]) }
          });
        }
      }
    };
  }
};
