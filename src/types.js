/* @flow */

type Location = {
  line: number,
  column: number,
};

const assert = (node, ...types) => {
  if (!types.some(t => t.check(node))) {
    throw new Error(
      `Expected ${types.map(t => t.name).join(' or ')}, but got ${node &&
        node.type}`
    );
  }
};

const helper = function<T>(type, create: (options: T) => *) {
  return {
    name: type,
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
  assert(value, FunctionCallExpression);

  return {
    value,
  };
});

const TypeDeclaration = helper('TypeDeclaration', ({ value }: *) => {
  assert(value, AssignmentExpression);
  assert(value.left, Identifier, TypeParameterExpression);
  assert(
    value.right,
    Identifier,
    TypeInstantiationExpression,
    UnionOperation,
    ...Literals
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
    FunctionCallExpression,
    MathExpression,
    ...Literals
  );

  return {
    value,
  };
});

const FunctionDeclaration = helper('FunctionDeclaration', ({ value }: *) => {
  assert(value, AssignmentExpression);
  assert(value.left, FunctionParameterExpression);
  assert(
    value.right,
    Identifier,
    FunctionCallExpression,
    MathExpression,
    BlockStatement,
    ...Literals
  );

  return {
    value,
  };
});

const ReturnStatement = helper('ReturnStatement', ({ value }: *) => {
  assert(
    value,
    Identifier,
    FunctionCallExpression,
    MathExpression,
    ...Literals
  );

  return {
    value,
  };
});

const BlockStatement = helper('BlockStatement', ({ body }: *) => {
  body.forEach(node =>
    assert(node, TypeDeclaration, LetDeclaration, ReturnStatement)
  );

  return {
    body,
  };
});

const FunctionParameterExpression = helper(
  'FunctionParameterExpression',
  ({ id, params }: { id: *, params: Array<*> }) => {
    assert(id, Identifier);

    params.forEach(node => assert(node, Identifier, ...Literals));

    return {
      id,
      params,
    };
  }
);

const TypeParameterExpression = helper(
  'TypeParameterExpression',
  ({ id, params }: { id: *, params: Array<*> }) => {
    assert(id, Identifier);

    params.forEach(node => assert(node, Identifier, ...Literals));

    return {
      id,
      params,
    };
  }
);

const FunctionCallExpression = helper(
  'FunctionCallExpression',
  ({ id, params }: { id: *, params: Array<*> }) => {
    assert(id, Identifier);

    params.forEach(node => assert(node, Identifier, ...Literals));

    return {
      id,
      params,
    };
  }
);

const TypeInstantiationExpression = helper(
  'TypeInstantiationExpression',
  ({ id, params }: { id: *, params: Array<*> }) => {
    assert(id, Identifier);

    params.forEach(node => assert(node, Identifier, ...Literals));

    return {
      id,
      params,
    };
  }
);

const AssignmentExpression = helper(
  'AssignmentExpression',
  ({ left, right }: { left: *, right: * }) => {
    assert(
      left,
      Identifier,
      FunctionParameterExpression,
      TypeParameterExpression
    );
    assert(
      right,
      Identifier,
      LetDeclaration,
      FunctionCallExpression,
      TypeInstantiationExpression,
      MathExpression,
      UnionOperation,
      BlockStatement,
      ...Literals
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
    assert(left, Identifier, FunctionCallExpression, NumericLiteral);
    assert(
      right,
      Identifier,
      FunctionCallExpression,
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
  values.forEach(node =>
    assert(node, Identifier, TypeInstantiationExpression, ...Literals)
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

const BooleanLiteral = helper(
  'BooleanLiteral',
  ({ value }: { value: boolean }) => ({
    value,
  })
);

const NumericLiteral = helper(
  'NumericLiteral',
  ({ value }: { value: number }) => ({
    value,
  })
);

const Literals = [StringLiteral, BooleanLiteral, NumericLiteral];

exports.Program = Program;
exports.Identifier = Identifier;
exports.MainDeclaration = MainDeclaration;
exports.TypeDeclaration = TypeDeclaration;
exports.LetDeclaration = LetDeclaration;
exports.ReturnStatement = ReturnStatement;
exports.FunctionDeclaration = FunctionDeclaration;
exports.BlockStatement = BlockStatement;
exports.FunctionParameterExpression = FunctionParameterExpression;
exports.TypeParameterExpression = TypeParameterExpression;
exports.FunctionCallExpression = FunctionCallExpression;
exports.TypeInstantiationExpression = TypeInstantiationExpression;
exports.AssignmentExpression = AssignmentExpression;
exports.MathExpression = MathExpression;
exports.UnionOperation = UnionOperation;
exports.StringLiteral = StringLiteral;
exports.BooleanLiteral = BooleanLiteral;
exports.NumericLiteral = NumericLiteral;
