'use strict';
/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    docs: {
      description: 'enforce consistent spacing before inline comments',
      category: 'Stylistic Issues',
      recommended: true
    },
    fixable: 'whitespace'
  },
  create(context) {
    return {
      Program(node) {
        const { sourceCode } = context;
        const comments = sourceCode.getAllComments();
        comments.forEach(comment => {
          if (comment.type === 'Line') {
            const nextToken = sourceCode.getTokenBefore(comment, { includeComments: true });
            if (nextToken && nextToken.loc.start.line === comment.loc.end.line && nextToken.loc.end.column === comment.loc.start.column) {
              context.report({
                node,
                loc: comment.loc,
                message: 'Expected space before \'//\' in comment.',
                fix(fixer) { return fixer.insertTextBefore(comment, ' ') }
              });
            }
          }
        });
      }
    };
  }
};
