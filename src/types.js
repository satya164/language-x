/* @flow */

type Location = {
  line: number,
  column: number,
};

const helper = function<T>(type, create: (options: T) => *) {
  return {
    check: (node: any) => node && node.type === type,
    create: (options: T, loc: Location) => ({
      ...create(options),
      type,
      loc: {
        start: loc,
      },
    }),
  };
};

exports.Identifier = helper('Identifier', ({ name }: { name: string }) => ({
  name,
}));

exports.TypeDeclaration = helper('TypeDeclaration', ({ value }: *) => ({
  value,
}));

exports.LetDeclaration = helper('LetDeclaration', ({ value }: *) => ({
  value,
}));

exports.FunctionDeclaration = helper('FunctionDeclaration', ({ value }: *) => ({
  value,
}));

exports.ParameterExpression = helper(
  'ParameterExpression',
  ({ id, params }: { id: *, params: Array<*> }) => ({
    id,
    params,
  })
);

exports.AssignmentExpression = helper(
  'AssignmentExpression',
  ({ left, right }: { left: *, right: * }) => ({
    left,
    right,
  })
);

exports.MathExpression = helper(
  'MathExpression',
  ({
    left,
    right,
    operator,
  }: {
    left: *,
    right: *,
    operator: '/' | '*' | '+' | '-',
  }) => ({
    left,
    right,
    operator,
  })
);

exports.UnionOperation = helper(
  'UnionOperation',
  ({ values }: { values: * }) => ({
    values,
  })
);

exports.StringLiteral = helper(
  'StringLiteral',
  ({ value }: { value: string }) => ({
    value,
  })
);

exports.NumericLiteral = helper(
  'NumericLiteral',
  ({ value }: { value: number }) => ({
    value,
  })
);
