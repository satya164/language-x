/* @flow */

const parse = require('../parse');

it('parses type declaration', () => {
  expect(
    parse(`
    type Foo = Bar
    type Bar = Boolean | String | Number
    type Maybe Number = Nothing | Number
    type Users = List User
    `)
  ).toMatchSnapshot();
});

it('parses let declaration', () => {
  expect(
    parse(`
    let foo = 10
    let bar = "Hello world"
  `)
  ).toMatchSnapshot();
});
