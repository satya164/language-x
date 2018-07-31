/* @flow */

const tokenize = require('./tokenize');

const Identifier = 'Identifier';
const LetDeclaration = 'LetDeclaration';
const FunctionDeclaration = 'FunctionDeclaration';
const TypeDeclaration = 'TypeDeclaration';
const ParameterExpression = 'ParameterExpression';
const AssignmentExpression = 'AssignmentExpression';
const StringLiteral = 'StringLiteral';
const NumericLiteral = 'NumericLiteral';
const UnionOperation = 'UnionOperation';

const declaration = (token, peek, end) => {
  if (token && token.type === 'keyword') {
    if (token.value === 'type') {
      const expr = expression(peek(), peek, end);

      return {
        type: TypeDeclaration,
        value: expr,
      };
    }

    if (token.value === 'let') {
      const expr = expression(peek(), peek, end);

      return {
        type: LetDeclaration,
        value: expr,
      };
    }

    if (token.value === 'func') {
      const expr = expression(peek(), peek, end);

      return {
        type: FunctionDeclaration,
        value: expr,
      };
    }
  }
};

const expression = (token, peek, end) => {
  if (token && token.type === 'string') {
    return {
      type: StringLiteral,
      value: token.value,
    };
  }

  if (token && token.type === 'number') {
    return {
      type: NumericLiteral,
      value: parseFloat(token.value),
    };
  }

  if (token && token.type === 'identifier') {
    // Lookahead to determine the type of the expression
    let next = peek();
    let expr = {
      type: Identifier,
      name: token.value,
    };

    while (next && next.type === 'identifier') {
      // If the identifier is followed by more identifiers, it's call expression
      // For the first identifier, create our expression node
      // For later identifiers, add them to params
      expr =
        expr.type === Identifier
          ? {
              type: ParameterExpression,
              id: expr,
              params: [],
            }
          : expr;

      expr.params.push({
        type: Identifier,
        name: next.value,
      });

      next = peek();
    }
    if (next && (next.type === 'string' || next.type === 'number')) {
      // If the identifier is followed by a string ot number, it's call expression
      // Unlike identifiers, these can only be at the end
      expr =
        expr.type === Identifier
          ? {
              type: ParameterExpression,
              callee: expr,
              params: [],
            }
          : expr;

      expr.params.push(expression(next, peek, end));
    }

    if (next && next.type === 'operator') {
      if (next.value === '=') {
        // If we encounter the assignment operator, assume assignment expression
        // Assign the current expression to the left side and continue parsing the right side of assignment
        expr = {
          type: AssignmentExpression,
          left: expr,
          right: expression(peek(), peek, end),
        };
      }

      if (next.value === '|') {
        // If we encounter the union operator, assume union expression
        // Add the current expression to the list of values in the union
        const values = [expr];

        next = peek();

        while (next && next.type !== 'operator') {
          // Parse the next expression until we find an operator
          const value = expression(
            next,
            () => {
              // Custom peek implementation so parsing the expression ends at next operator
              next = peek();

              if (next && next.type === 'operator') {
                // Returning undefined will finish the parsing
                return;
              }

              return next;
            },
            end
          );

          if (value) {
            values.push(value);
          } else {
            break;
          }

          next = peek();
        }

        expr = {
          type: UnionOperation,
          values,
        };
      }
    }

    if (next && next.type === 'keyword') {
      // When we encounter a keyword, we end the statement
      end();
    }

    return expr;
  }
};

module.exports = function parse(code: string) {
  const body = [];

  const tokens = tokenize(code).filter(
    t => t.type !== 'whitespace' && t.type !== 'newline'
  );

  for (let i = 0, l = tokens.length; i < l; i++) {
    const token = tokens[i];
    const peek = () => {
      i++;
      return tokens[i];
    };
    const end = () => {
      i--;
    };

    body.push(declaration(token, peek, end) || expression(token, peek, end));
  }

  return body;
};
