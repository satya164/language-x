/* @flow */

type Keyword = {
  type: 'keyword',
  value: 'type' | 'let' | 'func',
};

type Operator = {
  type: 'operator',
  value: '=' | '|',
};

type Identifier = {
  type: 'identifier',
  value: string,
};

type Declaration = {
  type: 'type' | 'let' | 'func',
  value: string,
};

type Token = Keyword | Operator | Identifier | Declaration;

module.exports = function tokenize(code: string): Token[] {
  const tokens: Token[] = [];

  code.split(/\s/).forEach(part => {
    if (part === '') {
      return;
    } else if (part === 'type' || part === 'let' || part === 'func') {
      tokens.push({
        type: 'keyword',
        value: part,
      });
    } else if (part === '=' || part === '|') {
      tokens.push({
        type: 'operator',
        value: part,
      });
    } else {
      // If a value is found after a keyword, get the type of the value
      const before = tokens[tokens.length - 1];

      if (before) {
        if (before.type === 'keyword') {
          tokens.push(
            ({
              type: before.value,
              value: part,
            }: Declaration)
          );
        } else {
          tokens.push({
            type: 'identifier',
            value: part,
          });
        }
      } else {
        throw new Error('SyntaxError');
      }
    }
  });

  return tokens;
};
