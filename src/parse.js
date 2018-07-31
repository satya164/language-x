/* @flow */

const tokenize = require('./tokenize');

const Program = 'Program';
const Identifier = 'Identifier';
const LetDeclaration = 'LetDeclaration';
const TypeDeclaration = 'TypeDeclaration';
const CallExpression = 'CallExpression';
const AssignmentExpression = 'AssignmentExpression';
const StringLiteral = 'StringLiteral';
const NumericLiteral = 'NumericLiteral';
const UnionOperation = 'UnionOperation';

module.exports = function parse(code: string) {
  const root = {
    type: Program,
    body: [],
    parent: {},
  };

  const tokens = tokenize(code).filter(
    t => t.type !== 'whitespace' && t.type !== 'newline'
  );

  let current = root;
  let assignment = false;
  let union = false;

  for (let i = 0, l = tokens.length; i < l; i++) {
    const token = tokens[i];

    if (token.type === 'keyword') {
      while (
        current.parent.type === TypeDeclaration ||
        current.parent.type === LetDeclaration ||
        current.parent.type === Program
      ) {
        current = current.parent;
      }

      let expr;

      if (token.value === 'type') {
        expr = {
          type: TypeDeclaration,
          parent: current,
        };
      } else if (token.value === 'let') {
        expr = {
          type: LetDeclaration,
          parent: current,
        };
      } else {
        throw new Error(`Invalid keyword ${token.value}`);
      }

      current.body.push(expr);
      current = expr;
    } else if (token.type === 'identifier') {
      if (current.type === TypeDeclaration || current.type === LetDeclaration) {
        const expr = {
          type: Identifier,
          name: token.value,
          parent: current,
        };

        current.id = expr;
        current = expr;
      } else if (current.type === Identifier) {
        const expr = {
          type: Identifier,
          name: token.value,
          parent: current,
        };

        if (assignment) {
          current.value = expr;
          current = expr;
          assignment = false;
        } else if (union) {
          const expr = {
            type: UnionOperation,
            types: [],
            parent: current.parent,
          };

          expr.types.push(
            {
              ...current.value,
              parent: expr,
            },
            {
              type: Identifier,
              name: token.value,
              parent: current,
            }
          );

          current.value = expr;
          current = expr;
          union = false;
        } else {
          current.params = current.params || [];
          current.params.push({
            type: Identifier,
            name: token.value,
            parent: current,
          });
        }
      } else if (current.type === UnionOperation) {
        if (union) {
          current.types.push({
            type: Identifier,
            name: token.value,
            parent: current,
          });
          union = false;
        } else {
          current = current.parent;
        }
      }
    } else if (token.type === 'operator') {
      if (current.type === Identifier) {
        while (current.parent.type === Identifier) {
          current = current.parent;
        }
      }

      if (token.value === '=') {
        assignment = true;
      } else if (token.value === '|') {
        union = true;
      }
    }
  }

  return root;
};
