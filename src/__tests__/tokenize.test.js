/* @flow */

const dedent = require('dedent');
const tokenize = require('../tokenize');

it('tokenizes type declaration', () => {
  expect(
    tokenize(dedent`
    type Foo
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
