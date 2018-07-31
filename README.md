# Language X

A custom compile-to-javascript language for learning purposes.

It involves 3 main components:

1. Tokenizing: the code is read into small tokens representing identifiers, literals, operations etc.
2. Parsing: the parser takes the tokens and tries to convert it into an abstract syntax tree
3. Validator: the validator takes the AST and does a sanity check, e.g. - check for undefined identifiers (not implemented)
4. Compiling: finally the compiler takes the AST and prints into a JavaScript string

It includes an REPL which can be run with `yarn repl` (make sure to build the code first with `yarn build`).

Sample REPL output:

```
>>> let magic = 42
undefined
>>> fun wassup a b = {
... let c = a + b + magic
...
... return c
... }
undefined
>>> main wassup 3 5
50
```

## Program

A program can have a single `main` declaration as its entry point:

```
main App "Hello world"
```

Here we have a function call after the `main` keyword.

## Variables

Variables are declared with a `let` keyword:

```
let foo = 10

let bar = "Hello world"
```

## Functions

Functions are defined with the `fun` keyword:

```
fun add a b = a + b
```

Functions can also contain multiple statements:

```
fun add a b = {
  let c = a + b

  return c
}
```

Functions can be called like:

```
let result = add 3 4
```

## Type system (incomplete)

A type can also refer to other types via the `|` (`or`) notation:

```
type Bar = Boolean | Number
```

The `Maybe` type represents an optional type, which can be visualized as:

```
type Maybe Number = Nothing | Number
```

The `Record` and `List` types need extra metadata when being used:

```
type Users = List User

type User = Record {
  name: String,
  age: Number,
}
```
