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
    type Bar = Boolean | String | Number
    type Maybe Number = Nothing | Number
    type Users = List User
    `)
  ).toMatchSnapshot();
});

it('parses let declaration', () => {
  expect(
    parse(dedent`
    let foo = 10
    let bar = "Hello world"
  `)
  ).toMatchSnapshot();
});

it('parses function declaration', () => {
  expect(
    parse(dedent`
    func calc a b c = a + b * c
    func foo a add = add a
  `)
  ).toMatchSnapshot();
});

it('parses math expression', () => {
  expect(
    parse(dedent`
    let a = 10 * 30 + a - 20 / foo
  `)
  ).toMatchSnapshot();
});
