/* @flow */

type Location = {
  line: number,
  column: number,
};

export type Identifier = {
  name: string,
  loc: Location,
};

export type LetDeclaration = {
  id: Identifier,
  value: Identifier | StringLiteral | NumericLiteral,
  loc: Location,
};

export type TypeDeclaration = {
  id: Identifier,
  value: Identifier | UnionOperation,
  params: Identifier[],
  loc: Location,
};

export type StringLiteral = {
  value: string,
  loc: Location,
};

export type NumericLiteral = {
  value: string,
  loc: Location,
};

export type UnionOperation = {
  types: Identifier,
  loc: Location,
};
