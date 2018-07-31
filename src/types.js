/* @flow */

type Location = {
  line: number,
  column: number,
};

const assert = (node, ...types) => {
  if (!types.some(t => t.check(node))) {
    throw new Error(
      `Expected ${types.map(t => t.toString()).join(' or ')}, but got ${node &&
        node.type}`
    );
  }
};

const helper = function<T>(type, create: (options: T) => *) {
  return {
    toString: () => type,
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

const Program = helper('Program', ({ body }: { body: Array<*> }) => ({
  body,
}));

const Identifier = helper('Identifier', ({ name }: { name: string }) => ({
  name,
}));

const MainDeclaration = helper('MainDeclaration', ({ value }: *) => {
  assert(value, Identifier, ParameterExpression);

  return {
    value,
  };
});

const TypeDeclaration = helper('TypeDeclaration', ({ value }: *) => {
  assert(value, AssignmentExpression);
  assert(value.left, Identifier, ParameterExpression);
  assert(
    value.right,
    Identifier,
    ParameterExpression,
    UnionOperation,
    StringLiteral,
    NumericLiteral
  );

  return {
    value,
  };
});

const LetDeclaration = helper('LetDeclaration', ({ value }: *) => {
  assert(value, AssignmentExpression);
  assert(value.left, Identifier);
  assert(
    value.right,
    Identifier,
    ParameterExpression,
    MathExpression,
    StringLiteral,
    NumericLiteral
  );

  return {
    value,
  };
});

const FunctionDeclaration = helper('FunctionDeclaration', ({ value }: *) => {
  assert(value, AssignmentExpression);
  assert(value.left, Identifier, ParameterExpression);
  assert(
    value.right,
    Identifier,
    ParameterExpression,
    MathExpression,
    StringLiteral,
    NumericLiteral
  );

  return {
    value,
  };
});

const ParameterExpression = helper(
  'ParameterExpression',
  ({ id, params }: { id: *, params: Array<*> }) => {
    assert(id, Identifier);

    params.forEach(p => assert(p, Identifier, StringLiteral, NumericLiteral));

    return {
      id,
      params,
    };
  }
);

const AssignmentExpression = helper(
  'AssignmentExpression',
  ({ left, right }: { left: *, right: * }) => {
    assert(left, Identifier, ParameterExpression);
    assert(
      right,
      Identifier,
      ParameterExpression,
      MathExpression,
      UnionOperation,
      StringLiteral,
      NumericLiteral
    );

    return {
      left,
      right,
    };
  }
);

const MathExpression = helper(
  'MathExpression',
  ({
    left,
    right,
    operator,
  }: {
    left: *,
    right: *,
    operator: '/' | '*' | '+' | '-',
  }) => {
    assert(left, Identifier, ParameterExpression, NumericLiteral);
    assert(
      right,
      Identifier,
      ParameterExpression,
      MathExpression,
      NumericLiteral
    );

    return {
      left,
      right,
      operator,
    };
  }
);

const UnionOperation = helper('UnionOperation', ({ values }: { values: * }) => {
  values.forEach(v =>
    assert(v, Identifier, ParameterExpression, StringLiteral, NumericLiteral)
  );

  return {
    values,
  };
});

const StringLiteral = helper(
  'StringLiteral',
  ({ value }: { value: string }) => ({
    value,
  })
);

const NumericLiteral = helper(
  'NumericLiteral',
  ({ value }: { value: number }) => ({
    value,
  })
);

exports.Program = Program;
exports.Identifier = Identifier;
exports.MainDeclaration = MainDeclaration;
exports.TypeDeclaration = TypeDeclaration;
exports.LetDeclaration = LetDeclaration;
exports.FunctionDeclaration = FunctionDeclaration;
exports.ParameterExpression = ParameterExpression;
exports.AssignmentExpression = AssignmentExpression;
exports.MathExpression = MathExpression;
exports.UnionOperation = UnionOperation;
exports.StringLiteral = StringLiteral;
exports.NumericLiteral = NumericLiteral;
