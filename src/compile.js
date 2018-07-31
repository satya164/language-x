/* @flow */

const {
  Program,
  Identifier,
  MainDeclaration,
  TypeDeclaration,
  LetDeclaration,
  FunctionDeclaration,
  ReturnStatement,
  BlockStatement,
  ParameterExpression,
  InstantiationExpression,
  AssignmentExpression,
  MathExpression,
  UnionOperation,
  StringLiteral,
  NumericLiteral,
} = require('./types');

module.exports = function compile(node: *) {
  switch (node.type) {
    case Program.name:
      return `'use strict';\n\n${node.body.map(compile).join('\n\n')}`;

    case MainDeclaration.name:
      return compile(node.value);

    case TypeDeclaration.name:
    case UnionOperation.name:
      return '';

    case LetDeclaration.name:
      return `var ${compile(node.value)}`;

    case FunctionDeclaration.name:
      return `function ${compile(node.value.left)}${
        Identifier.check(node.value.left) ? '()' : ''
      } ${
        BlockStatement.check(node.value.right)
          ? compile(node.value.right)
          : `{ return ${compile(node.value.right)} }`
      }`;

    case ReturnStatement.name:
      return `return ${compile(node.value)};`;

    case BlockStatement.name:
      return `{\n${node.body.map(n => `  ${compile(n)}`).join('\n\n')}\n}`;

    case ParameterExpression.name:
      return `${compile(node.id)}(${node.params
        .map(n => compile(n))
        .join(', ')})`;

    case InstantiationExpression.name:
      return `${compile(node.id)}(${node.params
        .map(n => compile(n))
        .join(', ')});`;

    case AssignmentExpression.name:
      return `${compile(node.left)} = ${compile(node.right)};`;

    case MathExpression.name:
      return `${compile(node.left)} ${node.operator} ${compile(node.right)}`;

    case Identifier.name:
      return node.name;

    case NumericLiteral.name:
      return node.value;

    case StringLiteral.name:
      return `"${node.value}"`;

    default:
      throw new Error(`Unrecognized node type "${node.type}"`);
  }
};
