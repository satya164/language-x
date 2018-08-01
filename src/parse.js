/* @flow */

const tokenize = require('./tokenize');
const {
  Program,
  Identifier,
  MainDeclaration,
  TypeDeclaration,
  LetDeclaration,
  FunctionDeclaration,
  ReturnStatement,
  BlockStatement,
  FunctionParameterExpression,
  TypeParameterExpression,
  FunctionCallExpression,
  TypeInstantiationExpression,
  AssignmentExpression,
  MathExpression,
  UnionOperation,
  StringLiteral,
  NumericLiteral,
  BooleanLiteral,
} = require('./types');

const eof = token =>
  new Error(
    `Syntax error: unexpected end of block at ${token.loc.line}:${
      token.loc.column
    }`
  );

const error = token =>
  new Error(
    `Syntax error: unexpected ${token.type} "${token.value}" at ${
      token.loc.line
    }:${token.loc.column}`
  );

const expression = (token, peek, back) => {
  if (token) {
    if (token.type === 'keyword') {
      switch (token.value) {
        case 'main':
          return MainDeclaration.create(
            { value: expression(peek(), peek, back) },
            token.loc
          );

        case 'type':
          return TypeDeclaration.create(
            { value: expression(peek(), peek, back) },
            token.loc
          );

        case 'let':
          return LetDeclaration.create(
            { value: expression(peek(), peek, back) },
            token.loc
          );

        case 'fun':
          return FunctionDeclaration.create(
            { value: expression(peek(), peek, back) },
            token.loc
          );

        case 'return':
          return ReturnStatement.create(
            { value: expression(peek(), peek, back) },
            token.loc
          );

        default:
          throw error(token);
      }
    } else if (token.type === 'braces' && token.value === '{') {
      const body = [];

      let next = peek();

      while (
        next &&
        next.type === 'keyword' &&
        (next.value === 'type' ||
          next.value === 'let' ||
          next.value === 'return')
      ) {
        body.push(expression(next, peek, back));

        next = peek();
      }

      if (!next || !(next.type === 'braces' && next.value === '}')) {
        throw eof(token);
      }

      return BlockStatement.create({ body }, token.loc);
    }

    // Look at previous token to determine type of the expression
    const prev = back();
    peek(); // restore the index after going back

    // Lookahead to determine the type of the expression
    let next = peek();
    let expr;

    if (token.type === 'string') {
      expr = StringLiteral.create({ value: token.value }, token.loc);
    } else if (token.type === 'number') {
      expr = NumericLiteral.create(
        { value: parseFloat(token.value) },
        token.loc
      );
    } else if (token.type === 'boolean') {
      expr = BooleanLiteral.create(
        { value: token.value === 'true' },
        token.loc
      );
    } else if (token.type === 'identifier') {
      expr = Identifier.create({ name: token.value }, token.loc);
    }

    // Look at previous token to determine if it's a call expression or parameter expression
    // If it was started after type, fun, it's a parameter expression
    if (
      prev.value === 'type' &&
      next &&
      next.type === 'angle' &&
      next.value === '<'
    ) {
      expr = TypeParameterExpression.create(
        { id: expr, params: [] },
        token.loc
      );

      next = peek();

      while (next && next.type === 'identifier') {
        expr.params.push(Identifier.create({ name: next.value }, next.loc));

        next = peek();

        if (next && next.type === 'punctuation' && next.value === ',') {
          next = peek();
        } else {
          break;
        }
      }

      if (next && next.type === 'angle' && next.value === '>') {
        next = peek();
      } else {
        throw error(next || token);
      }
    } else if (
      prev.value === 'fun' &&
      next &&
      next.type === 'parens' &&
      next.value === '('
    ) {
      expr = FunctionParameterExpression.create(
        { id: expr, params: [] },
        token.loc
      );

      next = peek();

      while (next && next.type === 'identifier') {
        expr.params.push(Identifier.create({ name: next.value }, next.loc));

        next = peek();

        if (next && next.type === 'punctuation' && next.value === ',') {
          next = peek();
        } else {
          break;
        }
      }

      if (next && next.type === 'parens' && next.value === ')') {
        next = peek();
      } else {
        throw error(next || token);
      }
    } else if (next && next.type === 'angle' && next.value === '<') {
      expr = TypeInstantiationExpression.create(
        { id: expr, params: [] },
        token.loc
      );

      next = peek();

      while (
        next &&
        (next.type === 'identifier' ||
          next.type === 'string' ||
          next.type === 'number' ||
          next.type === 'boolean')
      ) {
        let node;

        if (next.type === 'string') {
          node = StringLiteral.create({ value: next.value }, next.loc);
        } else if (token.type === 'number') {
          node = NumericLiteral.create(
            { value: parseFloat(next.value) },
            next.loc
          );
        } else if (token.type === 'boolean') {
          node = BooleanLiteral.create(
            { value: next.value === 'true' },
            next.loc
          );
        } else if (next.type === 'identifier') {
          node = Identifier.create({ name: next.value }, next.loc);
        }

        expr.params.push(node);

        next = peek();

        if (next && next.type === 'punctuation' && next.value === ',') {
          next = peek();
        } else {
          break;
        }
      }

      if (next && next.type === 'angle' && next.value === '>') {
        next = peek();
      } else {
        throw error(next || token);
      }
    } else if (next && next.type === 'parens' && next.value === '(') {
      expr = FunctionCallExpression.create({ id: expr, params: [] }, token.loc);

      next = peek();

      while (
        next &&
        (next.type === 'identifier' ||
          next.type === 'string' ||
          next.type === 'number' ||
          next.type === 'boolean')
      ) {
        let node;

        if (next.type === 'string') {
          node = StringLiteral.create({ value: next.value }, next.loc);
        } else if (next.type === 'number') {
          node = NumericLiteral.create(
            { value: parseFloat(next.value) },
            next.loc
          );
        } else if (token.type === 'boolean') {
          node = BooleanLiteral.create(
            { value: next.value === 'true' },
            next.loc
          );
        } else if (next.type === 'identifier') {
          node = Identifier.create({ name: next.value }, next.loc);
        }

        expr.params.push(node);

        next = peek();

        if (next && next.type === 'punctuation' && next.value === ',') {
          next = peek();
        } else {
          break;
        }
      }

      if (next && next.type === 'parens' && next.value === ')') {
        next = peek();
      } else {
        throw error(next || token);
      }
    }

    if (next && next.type === 'operator') {
      if (next.value === '=') {
        // If we encounter the assignment operator, assume assignment expression
        // Assign the current expression to the left side and continue parsing the right side of assignment
        expr = AssignmentExpression.create(
          { left: expr, right: expression(peek(), peek, back) },
          token.loc
        );
      } else if (next.value === '|') {
        // If we encounter the union operator, assume union expression
        // Add the current expression to the list of values in the union
        const values = [expr];

        next = peek();

        while (next && next.type !== 'operator' && next.type !== 'keyword') {
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
            back
          );

          if (value) {
            values.push(value);
          } else {
            break;
          }

          next = peek();
        }

        expr = UnionOperation.create({ values }, token.loc);
      } else if (
        next.value === '/' ||
        next.value === '*' ||
        next.value === '+' ||
        next.value === '-'
      ) {
        expr = MathExpression.create(
          {
            left: expr,
            right: expression(peek(), peek, back),
            operator: next.value,
          },
          token.loc
        );
      }
    }

    if (
      next &&
      (next.type === 'keyword' ||
        (next.type === 'braces' && next.value === '}'))
    ) {
      // We end the statement when we find a keyword or end of a block
      // Move a step back to start parsing from the keyword
      back();
    }

    return expr;
  } else if (token) {
    throw error(token);
  }
};

module.exports = function parse(code: string) {
  const body = [];

  const tokens = tokenize(code);

  let main = false;

  for (let i = 0, l = tokens.length; i < l; i++) {
    const token = tokens[i];
    const peek = () => {
      i++;
      return tokens[i];
    };
    const back = () => {
      i--;
      return tokens[i];
    };

    if (token.type === 'keyword' && token.value === 'main') {
      if (main) {
        throw new Error(
          `Syntax error: duplicate ${token.type} "${token.value}" at ${
            token.loc.line
          }:${token.loc.column}`
        );
      }

      main = true;
    }

    body.push(expression(token, peek, back));
  }

  return Program.create({ body }, { line: 1, column: 0 });
};
