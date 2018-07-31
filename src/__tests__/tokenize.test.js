/* @flow */

const dedent = require('dedent');
const tokenize = require('../tokenize');

it('tokenizes main declaration', () => {
  expect(
    tokenize(dedent`
    main Foo Bar
  `)
  ).toMatchSnapshot();
});

it('tokenizes type declaration', () => {
  expect(
    tokenize(dedent`
    type Bar = Boolean | String | Number
    type Maybe Number = Nothing | Number
    type Users = List User
  `)
  ).toMatchSnapshot();
});

it('tokenizes let declaration', () => {
  expect(
    tokenize(dedent`
    let a = 10
  `)
  ).toMatchSnapshot();
});

it('tokenizes function declaration', () => {
  expect(
    tokenize(dedent`
    func add a b = a + b
  `)
  ).toMatchSnapshot();
});

it('tokenizes various types of numbers', () => {
  expect(
    tokenize(dedent`
    let a = 10
    let a = 10.30
    let a = +10
    let a = -10
    let a = .30
    let a = +.30
    let a = -.30
    let a = +0.30
    let a = -0.30
  `)
  ).toMatchSnapshot();
});

it('tokenizes strings', () => {
  expect(
    tokenize(dedent`
    let a = "Hello world"
    let a = "Numbers in strings +0.30"
    let a = "Operators in string (= | + - /)"
    let a = "Keywords such as let in string"
  `)
  ).toMatchSnapshot();
});
