/* @flow */

type Location = {
  line: number,
  column: number,
};

type Keyword = {
  type: 'keyword',
  value: $Keys<typeof keywords>,
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
  | Number
  | String
  | Whitespace
  | Newline;

const keywords = {
  main: true,
  type: true,
  let: true,
  func: true,
};

module.exports = function tokenize(
  code: string,
  strict: boolean = true
): Token[] {
  const tokens: Token[] = [];

  let line = 1; // lines start at 1
  let column = -1; // columns start at 0, use -1 to offset initial increment

  let string = false;

  for (let i = 0, l = code.length; i < l; i++) {
    let char = code.charAt(i);

    if (char === '\n') {
      line++;
      column = -1;
    } else {
      column++;
    }

    const last = tokens[tokens.length - 1];

    if (char === '"') {
      // This could be open or closing of a string
      // TODO: handle escaping and interpolating
      if (string) {
        string = false;
      } else {
        string = true;
        tokens.push({
          type: 'string',
          value: char,
          loc: { line, column },
        });
      }

      continue;
    }

    if (string) {
      // We want to skip tokenizing if it's a string
      last.value += char;

      continue;
    }

    switch (char) {
      case '\n':
        tokens.push({
          type: 'newline',
          value: char,
          loc: { line, column },
        });
        break;
      case '\t':
      case ' ':
        // Check for whitespace
        if (last && last.type === 'identifier' && keywords[last.value]) {
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
          } else if (/\d/.test(char) || char === '.') {
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
          } else if (strict) {
            throw new Error(
              `Syntax error: unexpected character "${char}" at ${line}:${column}`
            );
          }
        }
        break;
    }
  }

  return tokens;
};
