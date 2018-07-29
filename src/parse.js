/* @flow */

const tokenize = require('./tokenize');

const TypeDeclaration = 'TypeDeclaration';
const LetDeclaration = 'LetDeclaration';
const Identifier = 'Identifier';
const UnionType = 'UnionType';

module.exports = function parse(code: string) {
  const tokens = tokenize(code);
  const body = [];

  let current = body;

  for (let i = 0, l = tokens.length; i < l; i++) {
    const token = tokens[i];

    switch (token.type) {
      case 'keyword': {
        if (i !== 0) {
          current = current.parent;
        }

        if (token.value === 'type') {
          const expr = {
            type: TypeDeclaration,
            parent: current,
          };

          current.push(expr);
          current = expr;
        } else if (token.value === 'let') {
          const expr = {
            type: LetDeclaration,
            parent: current,
          };

          current.push(expr);
          current = expr;
        }

        break;
      }

      case 'let': {
        if (current.type === LetDeclaration) {
          current.name = token.value;
        } else {
          throw new Error('SyntaxError');
        }

        break;
      }

      case 'type': {
        if (current.type === TypeDeclaration) {
          current.name = token.value;
        } else {
          throw new Error('SyntaxError');
        }

        break;
      }

      case 'identifier': {
        if (
          current.type === TypeDeclaration ||
          current.type === LetDeclaration ||
          current.type === Identifier
        ) {
          current.params = current.params || [];
          current.params.push({
            type: Identifier,
            parent: current,
            name: token.value,
          });
        } else if (current.type === UnionType) {
          current.types.push({
            type: Identifier,
            parent: current,
            name: token.value,
          });

          // Lookahead to determine if there are more operators
          const next = tokens[i + 1];

          if (next && next.type === 'operator' && next.value === '|') {
            i++;
          } else {
            current = current.parent;
          }
        } else {
          throw new Error('SyntaxError');
        }

        break;
      }

      case 'operator': {
        if (
          (current.type === TypeDeclaration ||
            current.type === LetDeclaration) &&
          token.value === '='
        ) {
          // Lookahead to detrmine the type of assignment
          const next = tokens[i + 1];

          if (next && next.type === 'identifier') {
            i++;

            const expr = {
              type: Identifier,
              name: next.value,
              parent: current,
            };

            current.right = expr;
            current = expr;
          } else {
            throw new Error('SyntaxError');
          }
        } else if (
          current.parent.type === TypeDeclaration &&
          token.value === '|'
        ) {
          const expr = {
            type: UnionType,
            parent: current.parent,
            types: [],
          };

          expr.types.push({ ...current, parent: expr });

          current.parent.right = expr;
          current = expr;
        } else {
          throw new Error('SyntaxError');
        }

        break;
      }
      default:
        console.log({ token });
    }
  }

  return {
    program: {
      type: 'Program',
      body,
    },
  };
};
