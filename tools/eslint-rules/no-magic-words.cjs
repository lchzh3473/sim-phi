'use strict';
/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    docs: {
      description: 'disallow magic words',
      category: 'Stylistic Issues',
      recommended: true
    },
    fixable: 'whitespace',
    schema: [
      {
        type: 'object',
        properties: {
          words: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const options = context.options[0] || {};
    const words = options.words || [];
    return {
      Program(node) {
        const { sourceCode } = context;
        // not only report comments, but also report code
        const tokens = sourceCode.tokensAndComments;
        tokens.forEach(token => {
          const commentText = token.value.trim();
          words.forEach(word => {
          // use regex to match
            const regex = new RegExp(word, 'i');
            // if match, report original comment
            if (regex.test(commentText)) {
              context.report({
                node,
                loc: token.loc,
                message: `Magic word '${regex.exec(commentText)[0]}' found.`
              });
            }
          });
        });
      }
    };
  }
};
