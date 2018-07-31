const vm = require('vm');
const repl = require('repl');
const parse = require('./parse');
const compile = require('./compile');

repl.start({
  prompt: '>>> ',
  eval: (code, context, filename, callback) => {
    let ast;

    try {
      ast = parse(code);
    } catch (e) {
      if (/^Syntax error: unexpected end of block/.test(e.message)) {
        return callback(new repl.Recoverable(e));
      }

      return callback(e);
    }

    const js = compile(ast).replace(/^'use strict';/, '');
    const result = vm.runInThisContext(js);

    callback(null, result);
  },
  replMode: repl.REPL_MODE_STRICT,
});
