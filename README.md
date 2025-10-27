# 🚀 JistScript

> A TypeScript-based scripting language with **inline type annotations** for modern web development. State management without the boilerplate.

## 🚀 What is JistScript?

JistScript is a simple, powerful scripting language that compiles to JavaScript. It's designed for **data-centric applications** with built-in state management and inline type annotations.

[![npm version](https://img.shields.io/npm/v/jistscript.svg)](https://www.npmjs.com/package/jistscript) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Node.js Version](https://img.shields.io/node/v/jistscript.svg)](https://nodejs.org)

### ✨ Why JistScript?

| Feature              | JistScript                 | TypeScript          | JavaScript |
| -------------------- | -------------------------- | ------------------- | ---------- |
| **Inline Types**     | `useState:String("hello")` | Separate type files | No types   |
| **State Management** | Built-in with validation   | External libraries  | Manual     |
| **Type Safety**      | Runtime validation         | Compile-time only   | None       |
| **Learning Curve**   | Low                        | High                | Low        |
| **Setup Complexity** | Minimal                    | High                | None       |

## 📦 Installation

### Basic Installation

```bash
npm install jistscript
```

#### ★ Installation for Node.js Projects (as a Dev Dependency)

```bash
npm install --save-dev jistscript
```

### For Development (Deno)

```bash
# Clone the repository
git clone https://github.com/JistScript/Base
cd Base

# Install Deno
# macOS/Linux:
curl -fsSL https://deno.land/install.sh | sh

# Windows:
irm https://deno.land/install.ps1 | iex
```

## 🎯 Quick Start

### 1. Basic Usage (Compiler)

```bash
# Initialize config
npx jistc --init

# Compile a file
npx jistc myfile.jts

# Watch mode
npx jistc --watch
```

### 2. With Vite (React)

```javascript
// vite.config.js //
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { jistscript } from "jistscript/plugin-vite";

export default defineConfig({
  plugins: [jistscript(), react()],
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".jts", ".jtx"],
  },
});
```

## 💡 Features & Examples

### 🔥 Inline Type Annotations

No separate type files needed! Types are inline with your code:

```javascript
// String state //
const [name, setName] = useState:String("John Doe");

// Number state //
const [count, setCount] = useState:Number(0);

// Boolean state //
const [isActive, setIsActive] = useState:Boolean(true);

// Array with typed elements //
const [tags, setTags] = useState:Array(String, ["javascript", "typescript"]);

// Object state //
const [user, setUser] = useState:Object({
  username: "johndoe",
  email: "john@example.com",
  age: 25
});
```

### 🎨 Runtime Type Validation

JistScript validates types at runtime and warns you about mismatches:

```javascript
const [count, setCount] = useState:Number(0);
setCount("hello");
// ⚠️ Warning: Type mismatch: expected Number, got string

const [tags, setTags] = useState:Array(String, ["a", "b"]);
setTags([1, 2, 3]);
// ⚠️ Warning: Expected String elements in array
```

### 📊 Complete Type System

```javascript
// All supported types
const [str, setStr] = useState:String("text");
const [num, setNum] = useState:Number(42);
const [bool, setBool] = useState:Boolean(false);
const [arr, setArr] = useState:Array(Number, [1, 2, 3]);
const [obj, setObj] = useState:Object({ key: "value" });
```

### 🔄 State Management Example

**useTest.jts** (JistScript file example):

```javascript
const [count, setCount] = useState:Number(0);
const [name, setName] = useState:String("Hello");

function increment() {
  const newCount = setCount.getValue() + 1;
  setCount(newCount);
}

function updateName(newName) {
  setName(newName);
}

function subscribe(callback) {
  setCount.subscribe(callback);
  setName.subscribe(callback);
}

function useTest() {
  return {
    count: setCount.getValue(),
    name: setName.getValue(),
    increment: increment,
    updateName: updateName,
    subscribe: subscribe
  };
}
```

**React Component** (TypeScript/JSX):

```typescript
import useTest from './hooks/useTest.jts';
import { useState, useEffect } from 'react';

const App = () => {
  const [, forceUpdate] = useState(0);
  const data = useTest();

  useEffect(() => {
    data.subscribe(() => forceUpdate(n => n + 1));
  }, [data]);

  return (
    <div>
      <h1>Count: {data.count}</h1>
      <button onClick={data.increment}>Increment</button>

      <h2>Name: {data.name}</h2>
      <button onClick={() => data.updateName('Updated!')}>
        Update Name
      </button>
    </div>
  );
};
```

### 🛠️ Functions & Control Flow

```javascript
// Function declaration //
function add(x, y) {
  let result = x + y;
  return result;
}

// Function with state //
function counter() {
  const [count, setCount] = useState:Number(0);

  function increment() {
    setCount(count + 1);
  }

  return {
    value: count,
    increment: increment
  };
}

// Arithmetic operations //
const sum = 10 + 5;
const product = 3 * 4;
const division = 20 / 4;
```

### 📝 Data Structures

```javascript
// Objects //
const user = {
  name: "Alice",
  age: 30,
  active: true,
};

// Nested objects //
const config = {
  database: {
    host: "localhost",
    port: 5432,
  },
  cache: {
    enabled: true,
    ttl: 3600,
  },
};

// Arrays //
const numbers = [1, 2, 3, 4, 5];
const mixed = [42, "text", true, { key: "value" }];
```

### 🐛 Debugging

```javascript
// Built-in mark() function for logging //
mark(count, "Current count");
mark(user, "User object");
mark("Debug message");

// Output:
// [JistScript] 5 Current count
// [JistScript] { name: 'Alice', age: 30 } User object
// [JistScript] Debug message
```

## 🎯 Current Language Features

### ✅ Supported

- **Variables**: `const`, `let`
- **Types**: String, Number, Boolean, Object, Array
- **Functions**: Declaration, return statements
- **Operators**: `+`, `-`, `*`, `/`, `%`, `=`
- **Data Structures**: Objects, Arrays, nested structures
- **State Management**: `useState` with type annotations
- **Destructuring**: Array destructuring `[a, b] = array`
- **Built-ins**: `mark()` for logging

### 🚧 Stay tuned 🌱 exciting updates are on the way!

- **Comparison operators**: `===`, `!==`, `<`, `>`
- **Logical operators**: `&&`, `||`, `!`
- **Ternary operator**: `? :`
- **Comments**: `//` and `/* */`
- **If statements**: `if`, `else`, `else if`
- **Loops**: `for`, `while`
- **Single quotes**: `'string'`
- **Arrow functions**: `() => {}`
- **Template literals**: `` `string ${var}` ``

## 🔧 Configuration

**jistconfig.json:**

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "target": "esnext",
    "module": "esm",
    "jsx": "react-jsx",
    "sourcemap": true
  },
  "include": ["src/**/*.jts", "src/**/*.jtx"],
  "exclude": ["node_modules", "dist"]
}
```

## 📚 CLI Commands

```bash
# Compile all files
jistc

# Compile specific file
jistc file.jts

# Watch mode
jistc --watch
jistc -w

# Specify output directory
jistc --outDir ./build

# Initialize config
jistc --init

# Help
jistc --help

# Version
jistc --version
```

## 🔌 Build Tool Integration

### Vite

```javascript
import { jistscript } from "jistscript/plugin-vite";
export default { plugins: [jistscript()] };
```

### Webpack

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(jts|jtx)$/,
        use: "jistscript/plugin-webpack",
      },
    ],
  },
};
```

## 📖 File Extensions

- `.jts` - JistScript files (like `.ts`)
- `.jtx` - JistScript JSX files (like `.tsx`) - _Coming soon_

## 📄 License

MIT © [Joel Deon Dsouza](https://github.com/JistScript)

## 🔗 Links

- **NPM Package**: [npmjs.com/package/jistscript](https://www.npmjs.com/package/jistscript)
- **GitHub**: [github.com/JistScript/Base](https://github.com/JistScript/Base)
- **Issues**: [github.com/JistScript/Base/issues](https://github.com/JistScript/Base/issues)

## 📊 Project Status

- **Current Version**: 1.1.6
- **Status**: Active Development

## 🙏 Acknowledgments

- Inspired by TypeScript's type system
- Built with ❤️ for the JavaScript community
- Powered by Deno and Node.js
