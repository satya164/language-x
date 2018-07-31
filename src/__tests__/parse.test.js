/* @flow */

const print = require('ast-pretty-print');
const dedent = require('dedent');
const parse = require('../parse');

expect.addSnapshotSerializer({
  test: node => Boolean(node && node.type),
  print: node => print(node, false),
});

it('parses main declaration', () => {
  expect(
    parse(dedent`
    main Foo
    `)
  ).toMatchSnapshot();

  expect(
    parse(dedent`
    main Foo Bar
    `)
  ).toMatchSnapshot();

  expect(() =>
    parse(dedent`
    main Foo
    main Bar
    `)
  ).toThrowErrorMatchingSnapshot();

  expect(() =>
    parse(dedent`
    main Foo = 42
    `)
  ).toThrowErrorMatchingSnapshot();
});

it('parses type declaration', () => {
  expect(
    parse(dedent`
    type Foo = Bar
    type Bar = Boolean | String | Number | "foo" | 42
    type Maybe Number = Nothing | Number
    type Users = List User
    `)
  ).toMatchSnapshot();

  expect(() =>
    parse(dedent`
    type Foo = a + b
    `)
  ).toThrowErrorMatchingSnapshot();
});

it('parses let declaration', () => {
  expect(
    parse(dedent`
    let foo = 10
    let bar = "Hello world"
  `)
  ).toMatchSnapshot();

  expect(() =>
    parse(dedent`
    let foo bar = 10
  `)
  ).toThrowErrorMatchingSnapshot();

  expect(() =>
    parse(dedent`
    let foo = bar | baz
    `)
  ).toThrowErrorMatchingSnapshot();
});

it('parses function declaration', () => {
  expect(
    parse(dedent`
    func calc a b c = a + b * c
    func foo a add = add a
    func foo = show "hello world"
  `)
  ).toMatchSnapshot();

  expect(
    parse(dedent`
    func add a b = {
      let c = a + b

      return c
    }

    func foo = show "hello world"
  `)
  ).toMatchSnapshot();

  expect(() =>
    parse(dedent`
    func foo "hello world" = show test
    `)
  ).toThrowErrorMatchingSnapshot();

  expect(() =>
    parse(dedent`
    func foo = show "hello world" test
    `)
  ).toThrowErrorMatchingSnapshot();

  expect(() =>
    parse(dedent`
    func foo = bar | baz
    `)
  ).toThrowErrorMatchingSnapshot();
});

it('parses math expression', () => {
  expect(
    parse(dedent`
    let a = 10 * 30 + b - 20 / foo
  `)
  ).toMatchSnapshot();
});
