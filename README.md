# JistScript (Base Mark Model: 1)

This repository contains script implemented in TypeScript for a simple data type language. The parser is designed to tokenize input source code, parse it into an abstract syntax tree (AST), and provide functionalities to traverse and manipulate the AST.
These components include functionalities for environment creation, value handling, and runtime operations.

## Run time

Dependencies

```bash
  Deno https://deno.com
```

## Usage/Examples

- Types Rendering:

```javascript
Mark:1
>  const testCase = {
  TestCase:"test1",
  Number:10,
  Array: [1, 2, "Three"],
  Boolean: true,
  Null: null,
  Undefined: undefined,
  Object: {
    simple: false
  }
};

mark(testCase, "TestCase")
{
  type: "object",
  properties: Map(7) {
    "TestCase" => { value: "test1", type: "string" },
    "Number" => { value: 10, type: "number" },
    "Array" => {
      type: "array",
      elements: [
        { value: 1, type: "number" },
        { value: 2, type: "number" },
        { value: "Three", type: "string" }
      ]
    },
    "Boolean" => { type: "boolean", value: true },
    "Null" => { type: "null", value: null },
    "Undefined" => { type: "undefined" },
    "Object" => {
      type: "object",
      properties: Map(1) { "simple" => { type: "boolean", value: false } }
    }
  }
} { value: "TestCase", type: "string" }
{ type: "null", value: null }
>
```

- Function Rendering:

```javascript
Mark:1
>  function test(x, y) {
  let result = x + y;
}
const result = test(10, 10);
mark(result, "TestCase")
{ value: 20, type: "number" } { value: "TestCase", type: "string" }
{ type: "null", value: null }
>
```

## Note

- These components are designed to be used in conjunction with the parser to enhance its capabilities for interpreting and executing the parsed code.
- They provide essential functionalities for managing environments, handling runtime values, and defining native methods within the runtime environment.
- This parser is designed and may not cover all features or edge cases of a complete programming language, Not yet.
- The codebase is written in TypeScript and relies on Deno runtime for execution.

## Run Locally

Clone the project

```bash
  https://github.com/JistScript/Base.git
```

- Install Deno before executing the code.

To start the server:

```bash
  deno run -A main.t
```

To log input Run:

```bash
  mark(input)
```
