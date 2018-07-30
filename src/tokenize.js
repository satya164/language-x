/* @flow */

type Location = {
  line: number,
  column: number,
};

type Keyword = {
  type: 'keyword',
  value: 'type' | 'let' | 'func',
  loc: Location,
};

type Operator = {
  type: 'operator',
  value: '|' | '=' | '+' | '-' | '*' | '/',
  loc: Location,
};

type Identifier = {
  type: 'identifier',
  value: string,
  loc: Location,
};

type Declaration = {
  type: 'type' | 'let' | 'func',
  value: string,
  loc: Location,
};

type Number = {
  type: 'number',
  value: string,
  loc: Location,
};

type String = {
  type: 'string',
  value: string,
  loc: Location,
};

type Whitespace = {
  type: 'whitespace',
  value: string,
  loc: Location,
};

type Newline = {
  type: 'newline',
  value: string,
  loc: Location,
};

type Token =
  | Keyword
  | Operator
  | Identifier
  | Declaration
  | Number
  | String
  | Whitespace
  | Newline;

const keywords = ['type', 'let', 'func'];

module.exports = function tokenize(code: string): Token[] {
  const tokens: Token[] = [];

  let line = 0;
  let column = 0;

  for (let i = 0, l = code.length; i < l; i++) {
    let char = code.charAt(i);

    switch (char) {
      case '\n':
        tokens.push({
          type: 'newline',
          value: char,
          loc: { line, column },
        });
        line++;
        column = 0;
        break;
      case '|':
      case '=':
      case '*':
      case '/':
        tokens.push({
          type: 'operator',
          value: char,
          loc: { line, column },
        });
        break;
      case '+':
      case '-': {
        // We need to lookahead to determine if it's a number or an operation
        const next = code.charAt(i + 1);

        if (next === '.' || /\d/.test(next)) {
          // It's a float or integer
          tokens.push({
            type: 'number',
            value: char,
            loc: { line, column },
          });
        } else {
          tokens.push({
            type: 'operator',
            value: char,
            loc: { line, column },
          });
        }

        break;
      }
      default:
        {
          const last = tokens[tokens.length - 1];

          if (/[_a-zA-Z]/.test(char)) {
            // Check for identifiers and keywords
            if (last && last.type === 'identifier') {
              last.value += char;
            } else {
              tokens.push({
                type: 'identifier',
                value: char,
                loc: { line, column },
              });
            }
          } else if (/\d/i.test(char) || char === '.') {
            // Check for numbers
            if (last && last.type === 'number') {
              last.value += char;
            } else {
              tokens.push({
                type: 'number',
                value: char,
                loc: { line, column },
              });
            }
          } else if (/(\s|\t)/i.test(char)) {
            // Check for whitespace
            if (
              last &&
              last.type === 'identifier' &&
              keywords.includes(last.value)
            ) {
              /* $FlowFixMe */
              last.type = 'keyword';
            }

            if (last && last.type === 'whitespace') {
              last.value += char;
            } else {
              tokens.push({
                type: 'whitespace',
                value: char,
                loc: { line, column },
              });
            }
          } else {
            throw new Error(`Unhandled character "${char}"`);
          }
        }
        break;
    }

    column++;
  }

  return tokens;
};
