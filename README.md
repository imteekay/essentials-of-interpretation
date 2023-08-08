<samp>

# Essentials of Interpretation

These are notes from the [Essentials of Interpretation](https://dmitrysoshnikov.teachable.com/p/essentials-of-interpretation) course by Dmitry Soshnikov

# Compilers crash course

## Lecture 1: Parsers, ASTs, Interpreters, and Compilers

- Tokenizer (lexical analysis)
  - It builds tokens
  - It doesn't care about invalid syntax
- Parser (syntactic analysis)
  - It produces the AST (nodes, intermediate representations)
  - Can be
    - hand-written parsers: Recursive-descent parsers
    - automatically generated: LL(1)..L(k), PEG, GLR, LR(k)
- What does runtime semantics study?
  - What does it mean to define a variable?
  - What does it mean to define a function?
  - How scope works?
  - How functions are called? What's call stack?
  - How do you pass parameters?
- Interpreters vs Compilers
  - Interpreted languages
    - implement semantics themselves
    - AST-based (recursive) interpreters — it's a tree-based data structure
    - Bytecode-interpreters (VM) — a plain array of code instructions (close to real machines)
  - Compiled languages
    - delegate semantics to a target language
    - Ahead-of-time (AOT) compilers. e.g. C++
    - Just-in-time (JIT) compilers. e.g. JS
    - AST-transformers (transpilers) — high level compilers
- If you have a program and you need to have the output of this program, you need an interpreter
  - Having an interpreter
  - Having a compiler that translates to another program and hopes that it has an interpreter for that program
  - In the very low level, the interpreter exists: the CPU.
    - If you compile the code into machine code (x86/x64), the CPU will be able to execute it

## Lecture 2: AST Interpreters and Virtual Machines

- AST based interpreters
  - Using tree data structures to represent the source code
- Bytecode based interpreters (VMs)
  - it has an extra step called bytecode emitter phase to generate bytecode
  - AST can take more space and slower to traverse
  - it's plain array of bytes
  - types
    - stack-based machines
      - stack for operands and operators
      - the result is on top of the stack
    - regiter-based machines
      - set of virtual registers
      - register is a data storage
      - the result is in an accumulator register
      - mapped to real via register

## Lecture 3: Compilers — AOT, JIT, Transpiler

- AOT Compiler — Ahead of time translation
  - it's done before execution
  - code generator
    - produces intermediate representation
    - produces native code (x86 / x64)
- JIT Compiler — translation at runtime
  - call code generator in runtime, generate native code, and the CPU can interpret that
  - next time the code is called, it gets from the cache so it doesn't need to go through all the steps again
- AST Transformer — high level translation, also called transpiler
  - transform an AST into another AST
  - it can be the same language (e.g. JS to older versions of JS) or completely different language (e.g. Python to JavaScript)

## Lecture 4: Eva Programming Language

Representing an AST. For this source code

```
total = current + 150;
```

We have this AST

```
{
  type: "Assignment",
  left: {
    type: "Identifier",
    value: "total"
  },
  right: {
    type: "Addition",
    left: {
      type: "Identifier",
      value: "current"
    },
    right: {
      type: "Literal",
      value: 150
    }
  }
}
```

But it can be simplified

- `type`: 0
- `left`: 1
- `right`: 2

```
{
  0: "Assignment",
  1: {
    0: "Identifier",
    value: "total"
  },
  2: {
    0: "Addition",
    1: {
      0: "Identifier",
      value: "current"
    },
    2: {
      0: "Literal",
      value: 150
    }
  }
}
```

But now that it's using indices, we can transform this from a map to an array

```
[
  "Assignment",
  [
    "Identifier",
    "total"
  ],
  [
    "Addition",
    [
      "Identifier",
      "current"
    ],
    [
      "Literal",
      150
    ]
  ]
]
```

To simplify even more, we can transform the operators into actual symbols

```
[
  "set", // type tag
  "total", // left hand side
  [
    "+", // type tag
    "current", // left hand side
    150 // right hand side
  ] // right hand side
]
```

This representation has a name and it's called "S-expression" or "Symbolic expression"

### The Eva programming language

- Expression format

```
(+ 5 10) // adition -> 15
(set x 15) // assignment
(if (> x 10)
    (print "ok)
    (print "err))
```

- Function declaration

```
(def foo (bar)
  (+ bar 10))
```

All functions in Eva are closures.

- Lambda expression: anynmous function

```
(lambda (x) (* x x) 10) // 10 — IILE - immediately-invoked lambda expression
```

- Design goals
  - simple syntax: S-expression
  - Everything is an expression
    - statement vs expression
      - statement: there's no value produced
      - expression: always produces a value
  - No explicit return, last evaluated expression is the result
  - Support first-class functions: assign to variables, pass as arguments, return as values
  - Static scope: all functions are closures
  - FP, imperative, OOP
  - Namespaces and modules
  - Lambda functions, IILEs

## Lecture 5: Self-evaluating expressions

To define the semantics of the Eva language, we'll be using the BNF (Backus-Naur Form)

- Interpret numbers
- Interpret strings
- Interpret addition

## Lecture 6: Variables and Environments

Environment: it's a storage, a repository of all variables and functions defined in a scope

- Environment Record: the storage, the table (map)
- Optional reference to Parent Environment
  - e.g. local scope of a function can access the global scope

The API of an environment is to

- Define a variable (e.g. `(var x 10)`)
- Assign a new value to a variable (e.g. `(set x 10)`)
- Lookup a variable (e.g. `x`)

## Lecture 7: Blocks: expression groups and Nested Scopes

Blocks are used to group expressions.

- Block scope: create a new environment

```js
let x = 10;
console.log(x); // 10

{
  let x = 20;
  console.log(x); // 20
}

console.log(x); // 10
```

## Lecture 8: Control flow: If and While expressions

- Moving all tests to the `__tests__` folder to make it more maintainable
- Implementing if expressions
- Implementing while expressions

## Lecture 9: Back to parsers: S-expression to AST

- Using the generated parser from syntax-cli based on BNF for tests
- Add a test util to abstract the parser and the test expectation
- Now it's enabled to run the actual code in a string format rather than array of arrays

## Lecture 10: Built-in and Native functions

- Math and comparison operators should be built-in functions
- Because they are built-in, we don't need to interpret them, just use native code
- They should be part of the global environment, it will hold all built-in functions

## Lecture 11: User-defined functions, Activation Records and Closures

- A closure is a function which captures its definition environment
  - it's aware all defined variables and values declated in the environment the function is defined
- For the function scope, it should have a new environment
  - with all the function params
  - and with the parent scope values
- The function scope is created and then the body is evaluated
  - The body can be a block or not a block

## Lecture 14: Syntactic sugar: Switch, For, Inc, Dec operators

- Syntactic Sugar: a nicer syntax for existing semantics

## Lecture 15: Object-oriented Eva: Classes

- A class is just an environment
  - It's a named environment which can be instantiated and create objects
- The environment structure has two parts
  - The environment record where values are stored
  - An optional reference to the Parent Environment
- The class "environment" is structured the same way
  - The environment record is used to store methods defined in the class
  - The parent reference is used to implement inheritance
- The instance is also an environment which will
  - store some properties/attributes
  - the parent link is set to the class, so it can find methods defined in the class and call these method in the needed context

## Lecture 16: Class inheritance and Super calls

- Inheritance: classes can have super or parent classes
- If set to `null`, it doesn't have it and the class inherit the global environment. If set to a declared class, it can get properties and methods from the set parent class
- The `super` expression returns the parent class/environment so the child class can reuse properties and methods from the parent class

</samp>
