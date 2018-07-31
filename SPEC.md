# X language specification

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

## Variables

Variables are declared with a `let` keyword:

```
let foo = 10

let bar = "Hello world"
```

## Functions

Functions are defined with the `func` keyword:

```
func add a b => a + b
```
