/* @flow */

const dedent = require('dedent');
const parse = require('../parse');
const compile = require('../compile');

it('compiles program to JavaScript', () => {
  expect(
    compile(
      parse(dedent`
    let a = 10 * 30 + b - 20 / foo
    let b = "Hello world"

    fun add a b = {
      let c = a + b

      return c
    }

    fun foo = add 3 4

    main add 3 4
  `)
    )
  ).toMatchSnapshot();
});
