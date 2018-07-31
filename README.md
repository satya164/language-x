# X language specification

## Program

A program can have a single `main` declartion as it's entry point:

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

## Type system

The language provides the following types:

* Boolean
* String
* Number
* Record {}
* List T
* Maybe T
* Nothing

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
