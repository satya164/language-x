const vm = require('vm');
const repl = require('repl');
const path = require('path');
const fs = require('fs');
const parse = require('./parse');
const compile = require('./compile');

const server = repl.start({
  prompt: '>>> ',
  eval: (code, context, filename, callback) => {
    let ast;

    try {
      // Parse the code to an AST
      ast = parse(code);
    } catch (e) {
      // If we detect incomplete input, pass a recoverable error
      // This will enable multiline mode to enter the full code
      if (/^Syntax error: unexpected end of block/.test(e.message)) {
        return callback(new repl.Recoverable(e));
      }

      return callback(e);
    }

    // Compile the code to JavaScript so we can execute it
    // Remove the 'use strict' directive to avoid printing it
    const js = compile(ast).replace(/^'use strict';/, '');
    const result = vm.runInThisContext(js);

    callback(null, result);
  },
  replMode: repl.REPL_MODE_STRICT,
});

// A history file will enable persistence history between sessions
const histfile = path.join(__dirname, '..', 'node_modules', '.x-repl-history');

const exists = fs.existsSync(histfile);

if (exists) {
  // If the history file exists, read the content and add the lines to the history
  fs.readFileSync(histfile, { encoding: 'utf-8' })
    .split('\n')
    .filter(line => line.trim())
    .reverse()
    .forEach(line => server.history.push(line));
} else {
  // If the history file doesn't exist, create it so we can append history later
  fs.writeFileSync(histfile, '', { encoding: 'utf-8' });
}

server.on('exit', () => {
  // Save the history into the history file on exit
  fs.appendFileSync(histfile, server.lines.join('\n'));
  process.exit();
});
