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
  assert(value, Identifier, FunctionCallExpression);

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
    FunctionCallExpression,
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
  assert(value.left, Identifier, FunctionParameterExpression);
  assert(
    value.right,
    Identifier,
    FunctionCallExpression,
    MathExpression,
    StringLiteral,
    NumericLiteral,
    BlockStatement
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
    StringLiteral,
    NumericLiteral
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

    params.forEach(node =>
      assert(node, Identifier, StringLiteral, NumericLiteral)
    );

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

    params.forEach(node =>
      assert(node, Identifier, StringLiteral, NumericLiteral)
    );

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

    params.forEach(node =>
      assert(node, Identifier, StringLiteral, NumericLiteral)
    );

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

    params.forEach(node =>
      assert(node, Identifier, StringLiteral, NumericLiteral)
    );

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
      StringLiteral,
      NumericLiteral,
      BlockStatement
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
    assert(
      node,
      Identifier,
      TypeInstantiationExpression,
      StringLiteral,
      NumericLiteral
    )
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
exports.NumericLiteral = NumericLiteral;
