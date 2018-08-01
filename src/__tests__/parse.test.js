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
    main foo()
    `)
  ).toMatchSnapshot();

  expect(
    parse(dedent`
    main foo(bar)
    `)
  ).toMatchSnapshot();

  expect(() =>
    parse(dedent`
    main foo()
    main bar()
    `)
  ).toThrowErrorMatchingSnapshot();

  expect(() =>
    parse(dedent`
    main foo = 42
    `)
  ).toThrowErrorMatchingSnapshot();
});

it('parses type declaration', () => {
  expect(
    parse(dedent`
    type Foo = Bar
    type Bar = Boolean | String | Number | "foo" | 42
    type Maybe<Number> = Nothing | Number
    type Users = List<User>
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
    let bar = true
    let baz = "Hello world"
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
    fun calc(a, b, c) = a + b * c
    fun foo(a, add) = add(a)
    fun foo() = show("hello world")
  `)
  ).toMatchSnapshot();

  expect(
    parse(dedent`
    fun add(a, b) = {
      let c = a + b

      return c
    }

    fun foo() = add(3, 4)
  `)
  ).toMatchSnapshot();

  expect(() =>
    parse(dedent`
    fun foo = "Hello world"
    `)
  ).toThrowErrorMatchingSnapshot();

  expect(() =>
    parse(dedent`
    fun foo("hello world") = test
    `)
  ).toThrowErrorMatchingSnapshot();

  expect(() =>
    parse(dedent`
    fun foo() = bar | baz
    `)
  ).toThrowErrorMatchingSnapshot();

  expect(() =>
    parse(dedent`
    fun foo() = {
    `)
  ).toThrowErrorMatchingSnapshot();

  expect(() =>
    parse(dedent`
    fun foo() = {
      let a = 3 + 7

      return a
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
