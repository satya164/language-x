/* @flow */

const tokenize = require('./tokenize');
const {
  MainDeclaration,
  TypeDeclaration,
  LetDeclaration,
  FunctionDeclaration,
  Identifier,
  ParameterExpression,
  StringLiteral,
  NumericLiteral,
  AssignmentExpression,
  UnionOperation,
  MathExpression,
} = require('./types');

const error = token =>
  new Error(
    `Syntax error: unexpected ${token.type} "${token.value}" at ${
      token.loc.line
    }:${token.loc.column}`
  );

const declaration = (token, peek, end) => {
  if (token && token.type === 'keyword') {
    switch (token.value) {
      case 'main':
        return MainDeclaration.create(
          { value: expression(peek(), peek, end) },
          token.loc
        );

      case 'type':
        return TypeDeclaration.create(
          { value: expression(peek(), peek, end) },
          token.loc
        );

      case 'let':
        return LetDeclaration.create(
          { value: expression(peek(), peek, end) },
          token.loc
        );

      case 'func':
        return FunctionDeclaration.create(
          { value: expression(peek(), peek, end) },
          token.loc
        );

      default:
        throw error(token);
    }
  } else if (token) {
    throw error(token);
  }
};

const expression = (token, peek, end) => {
  if (token) {
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
    } else if (token.type === 'identifier') {
      expr = Identifier.create({ name: token.value }, token.loc);
    } else {
      throw error(token);
    }

    while (next && next.type === 'identifier') {
      // If the identifier is followed by more identifiers, it's parameter expression
      // For the first identifier, create our expression node
      // For later identifiers, add them to params
      expr = Identifier.check(expr)
        ? ParameterExpression.create({ id: expr, params: [] }, token.loc)
        : expr;

      /* $FlowFixMe */
      expr.params.push(Identifier.create({ name: next.value }, next.loc));

      next = peek();
    }

    if (next && (next.type === 'string' || next.type === 'number')) {
      // If the identifier is followed by a string ot number, it's parameter expression
      // Unlike identifiers, these can only be at the end
      expr = Identifier.check(expr)
        ? ParameterExpression.create({ id: expr, params: [] }, token.loc)
        : expr;

      expr.params.push(expression(next, peek, end));
    } else if (next && next.type === 'operator') {
      if (next.value === '=') {
        // If we encounter the assignment operator, assume assignment expression
        // Assign the current expression to the left side and continue parsing the right side of assignment
        expr = AssignmentExpression.create(
          { left: expr, right: expression(peek(), peek, end) },
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
            end
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
            right: expression(peek(), peek, end),
            operator: next.value,
          },
          token.loc
        );
      }
    }

    if (next && next.type === 'keyword') {
      // When we encounter a keyword, we end the statement
      end();
    }

    return expr;
  } else if (token) {
    throw error(token);
  }
};

module.exports = function parse(code: string) {
  const body = [];

  const tokens = tokenize(code).filter(
    t => t.type !== 'whitespace' && t.type !== 'newline'
  );

  let main = false;

  for (let i = 0, l = tokens.length; i < l; i++) {
    const token = tokens[i];
    const peek = () => {
      i++;
      return tokens[i];
    };
    const end = () => {
      i--;
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

    body.push(declaration(token, peek, end));
  }

  return body;
};
