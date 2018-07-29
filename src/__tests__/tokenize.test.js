/* @flow */

const tokenize = require('../tokenize');

it('tokenizes type declaration', () => {
  expect(
    tokenize(`
    type Foo
    type Bar = Boolean | String | Number
    type Maybe Number = Nothing | Number
    type Users = List User
  `)
  ).toMatchSnapshot();
});

it('tokenizes let declaration', () => {
  expect(
    tokenize(`
    let a = 10;
  `)
  ).toMatchSnapshot();
});
