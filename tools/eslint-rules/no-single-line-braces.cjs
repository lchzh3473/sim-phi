'use strict';
/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Disallow braces for single line statements.'
    },
    fixable: 'whitespace'
  },
  create(context) {
    return {
      IfStatement(node) {
        qwq(node.consequent);
        if (node.alternate) qwq(node.alternate);
      },
      ForStatement(node) { qwq(node.body) },
      ForInStatement(node) { qwq(node.body) },
      ForOfStatement(node) { qwq(node.body) },
      WhileStatement(node) { qwq(node.body) },
      DoWhileStatement(node) { qwq(node.body) }
    };
    function qwq(node) {
      if (node.type === 'BlockStatement' && node.body.length === 1) {
        if (node.loc.end.line === node.loc.start.line) {
          context.report({
            node,
            message: 'Unexpected braces for single line statement.',
            fix(fixer) {
              const { sourceCode } = context;
              const openingBrace = sourceCode.getFirstToken(node);
              const closingBrace = sourceCode.getLastToken(node);
              const firstValueToken = sourceCode.getFirstToken(node.body[0]);
              const lastValueToken = sourceCode.getLastToken(node.body[0]);
              return [
                fixer.removeRange([openingBrace.range[0], firstValueToken.range[0]]),
                fixer.removeRange([lastValueToken.range[1], closingBrace.range[1]])
              ];
            }
          });
        }
      }
    }
  }
};
