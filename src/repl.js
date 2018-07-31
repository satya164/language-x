const vm = require('vm');
const repl = require('repl');
const parse = require('./parse');
const compile = require('./compile');

repl.start({
  prompt: '>>> ',
  eval: (code, context, filename, callback) => {
    const ast = parse(code);
    const js = compile(ast).replace(/^'use strict';/, '');

    callback(null, vm.runInThisContext(js));
  },
  replMode: repl.REPL_MODE_STRICT,
});
