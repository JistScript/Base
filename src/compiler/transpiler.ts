import {
  Statement,
  Program,
  Expression,
  VarDeclaration,
  FunctionDeclaration,
  BinaryExpr,
  CallExpr,
  MemberExpr,
  ObjectLiteral,
  ArrayLiteral,
  AssignmentExpr,
  TypeAnnotation,
  ReturnStatement,
  IfStatement,
  WhileStatement,
  ForOfStatement,
  UnaryExpr,
  ConditionalExpr,
  ArrowFunctionExpression,
} from "../parser/typeAst.js";

interface TranspileOptions {
  target?: "es5" | "es6" | "esnext";
  module?: "commonjs" | "esm";
  jsx?: "react" | "react-jsx" | "preserve";
  sourcemap?: boolean;
  injectRuntime?: boolean;
  autoExport?: boolean;
}

// Names exported by "jistscript/runtime" that are auto-imported into every program //
const STDLIB = [
  "sum",
  "avg",
  "pluck",
  "where",
  "sortBy",
  "groupBy",
  "summarize",
  "table",
  "barChart",
  "toHTML",
  "render",
  "parseCSV",
];

export function transpileToJS(ast: Program, options: TranspileOptions = {}): string {
  const ctx = new TranspileContext(options);
  const programCode = transpileProgram(ast, ctx);

  // Enhanced State management runtime with subscribe and getValue
  const runtime =
    options.injectRuntime !== false
      ? `// JistScript Runtime
const mark = typeof window !== 'undefined' && window.console
  ? (...args) => console.log('[JistScript]', ...args)
  : (...args) => console.log('[JistScript]', ...args);

// State management system
const __jist_state_counter = { value: 0 };
const __jist_state_store = new Map();

function useState(initialValue, typeInfo) {
  const stateId = __jist_state_counter.value++;

  if (!__jist_state_store.has(stateId)) {
    __jist_state_store.set(stateId, {
      value: initialValue,
      listeners: []
    });
  }

  const stateEntry = __jist_state_store.get(stateId);

  const setState = (newValue) => {
    if (typeInfo && !validateType(newValue, typeInfo)) {
      console.warn(\`[JistScript] Type mismatch: expected \${typeInfo.typeName}, got \${typeof newValue}\`);
    }
    stateEntry.value = newValue;

    stateEntry.listeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.error('[JistScript] Error in listener:', e);
      }
    });

    return newValue;
  };

  setState.subscribe = (callback) => {
    stateEntry.listeners.push(callback);
  };

  setState.getValue = () => {
    return stateEntry.value;
  };

  return [stateEntry.value, setState];
}

function validateType(value, typeInfo) {
  switch (typeInfo.typeName) {
    case 'String':
      return typeof value === 'string';
    case 'Number':
      return typeof value === 'number';
    case 'Boolean':
      return typeof value === 'boolean';
    case 'Array':
      if (!Array.isArray(value)) return false;
      if (typeInfo.elementType) {
        return value.every(item => validateType(item, { typeName: typeInfo.elementType }));
      }
      return true;
    case 'Object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    default:
      return true;
  }
}

`
      : "";

  // Auto-export if enabled //
  let exportCode = "";
  if (options.autoExport) {
    const functions = ast.body
      .filter(stmt => stmt.kind === "FunctionDeclaration")
      .map(stmt => (stmt as FunctionDeclaration).name);

    if (functions.length > 0) {
      const lastFunc = functions[functions.length - 1];
      const namedExports = functions.slice(0, -1);

      if (namedExports.length > 0) {
        exportCode += `\nexport { ${namedExports.join(", ")} };`;
      }
      exportCode += `\nexport default ${lastFunc};`;
    }
  }

  // Auto-import the stdlib, skipping any name the program declares itself //
  const declared = new Set<string>();
  for (const s of ast.body) {
    if (s.kind === "FunctionDeclaration") declared.add((s as FunctionDeclaration).name);
    if (s.kind === "VarDeclaration") {
      const d = s as VarDeclaration;
      if (d.destructuring) d.destructuring.elements.forEach(e => declared.add(e.symbol));
      else declared.add(d.identifier);
    }
  }
  const names = STDLIB.filter(n => !declared.has(n)).join(", ");
  const stdlibImport = names
    ? options.module === "commonjs"
      ? `const { ${names} } = require("jistscript/runtime");\n`
      : `import { ${names} } from "jistscript/runtime";\n`
    : "";

  return stdlibImport + runtime + programCode + exportCode;
}

class TranspileContext {
  indent = 0;
  options: TranspileOptions;

  constructor(options: TranspileOptions) {
    this.options = options;
  }

  getIndent(): string {
    return "  ".repeat(this.indent);
  }
}

// Expression kinds that must be parenthesized when used as an operand, so precedence survives //
const WRAP = new Set([
  "BinaryExpr",
  "LogicalExpr",
  "ConditionalExpr",
  "ArrowFunctionExpression",
  "AssignmentExpr",
  "UnaryExpr",
]);

function operand(e: Expression, ctx: TranspileContext): string {
  const code = transpileExpression(e, ctx);
  return WRAP.has(e.kind) ? `(${code})` : code;
}

function transpileProgram(program: Program, ctx: TranspileContext): string {
  const statements = program.body.map(stmt => transpileStatement(stmt, ctx));
  return statements.join("\n");
}

function transpileBlock(body: Statement[], ctx: TranspileContext): string {
  ctx.indent++;
  const code = body.map(s => transpileStatement(s, ctx)).join("\n");
  ctx.indent--;
  return `{\n${code}\n${ctx.getIndent()}}`;
}

function transpileIf(node: IfStatement, ctx: TranspileContext, prefix: string): string {
  let out = `${prefix}if (${transpileExpression(node.test, ctx)}) ${transpileBlock(node.consequent, ctx)}`;
  if (node.alternate) {
    out +=
      " else " +
      (Array.isArray(node.alternate)
        ? transpileBlock(node.alternate, ctx)
        : transpileIf(node.alternate, ctx, ""));
  }
  return out;
}

function transpileStatement(stmt: Statement, ctx: TranspileContext): string {
  const indent = ctx.getIndent();

  switch (stmt.kind) {
    case "VarDeclaration": {
      const decl = stmt as VarDeclaration;
      const keyword = decl.constant ? "const" : "let";
      if (decl.destructuring && decl.value) {
        const elements = decl.destructuring.elements.map(e => e.symbol).join(", ");
        const value = transpileExpression(decl.value, ctx);
        return `${indent}${keyword} [${elements}] = ${value};`;
      }
      const value = decl.value ? transpileExpression(decl.value, ctx) : "undefined";
      return `${indent}${keyword} ${decl.identifier} = ${value};`;
    }

    case "FunctionDeclaration": {
      const fn = stmt as FunctionDeclaration;
      const params = fn.parameters.join(", ");
      return `${indent}function ${fn.name}(${params}) ${transpileBlock(fn.body, ctx)}`;
    }

    case "ReturnStatement": {
      const returnStmt = stmt as ReturnStatement;
      if (returnStmt.value) {
        const value = transpileExpression(returnStmt.value, ctx);
        return `${indent}return ${value};`;
      }
      return `${indent}return;`;
    }

    case "IfStatement":
      return transpileIf(stmt as IfStatement, ctx, indent);

    case "WhileStatement": {
      const w = stmt as WhileStatement;
      return `${indent}while (${transpileExpression(w.test, ctx)}) ${transpileBlock(w.body, ctx)}`;
    }

    case "ForOfStatement": {
      const f = stmt as ForOfStatement;
      return `${indent}for (${f.constant ? "const" : "let"} ${f.variable} of ${transpileExpression(f.iterable, ctx)}) ${transpileBlock(f.body, ctx)}`;
    }

    default:
      return `${indent}${transpileExpression(stmt as Expression, ctx)};`;
  }
}

function transpileExpression(expr: Expression, ctx: TranspileContext): string {
  switch (expr.kind) {
    case "NumericLiteral":
      return String((expr as any).value);

    case "StringLiteral":
      return JSON.stringify((expr as any).value);

    case "Identifier":
      return (expr as any).symbol;

    case "BinaryExpr":
    case "LogicalExpr": {
      const b = expr as BinaryExpr;
      return `${operand(b.left, ctx)} ${b.operator} ${operand(b.right, ctx)}`;
    }

    case "UnaryExpr": {
      const u = expr as UnaryExpr;
      return `${u.operator}${operand(u.argument, ctx)}`;
    }

    case "ConditionalExpr": {
      const c = expr as ConditionalExpr;
      return `${operand(c.test, ctx)} ? ${transpileExpression(c.consequent, ctx)} : ${operand(c.alternate, ctx)}`;
    }

    case "ArrowFunctionExpression": {
      const fn = expr as ArrowFunctionExpression;
      const params = fn.parameters.join(", ");
      const only =
        fn.body.length === 1 && fn.body[0].kind === "ReturnStatement"
          ? ((fn.body[0] as ReturnStatement).value as Expression | undefined)
          : undefined;
      if (only) {
        const v = transpileExpression(only, ctx);
        return `(${params}) => ${only.kind === "ObjectLiteral" ? `(${v})` : v}`;
      }
      return `(${params}) => ${transpileBlock(fn.body, ctx)}`;
    }

    case "AssignmentExpr": {
      const assign = expr as AssignmentExpr;
      const left = transpileExpression(assign.assigne, ctx);
      const right = transpileExpression(assign.value, ctx);
      return `${left} = ${right}`;
    }

    case "CallExpr": {
      const call = expr as CallExpr;
      const caller = operand(call.caller, ctx);
      if (caller === "useState" && call.typeAnnotation) {
        const typeInfo = transpileTypeAnnotation(call.typeAnnotation);
        const args = call.args.map(arg => transpileExpression(arg, ctx)).join(", ");
        return `useState(${args}, ${typeInfo})`;
      }
      const args = call.args.map(arg => transpileExpression(arg, ctx)).join(", ");
      return `${caller}(${args})`;
    }

    case "MemberExpr": {
      const member = expr as MemberExpr;
      const obj = operand(member.object, ctx);
      const prop = transpileExpression(member.property, ctx);
      return member.computed ? `${obj}[${prop}]` : `${obj}.${prop}`;
    }

    case "ObjectLiteral": {
      const obj = expr as ObjectLiteral;
      const props = obj.properties
        .map(p => {
          if (p.value) {
            const val = transpileExpression(p.value, ctx);
            return `${p.key}: ${val}`;
          }
          return p.key;
        })
        .join(", ");
      return `{ ${props} }`;
    }

    case "ArrayLiteral": {
      const arr = expr as ArrayLiteral;
      const elements = arr.elements.map(el => transpileExpression(el, ctx)).join(", ");
      return `[${elements}]`;
    }

    default:
      return `/* Unknown: ${expr.kind} */`;
  }
}

function transpileTypeAnnotation(typeAnnotation: TypeAnnotation): string {
  let typeInfo = `{ typeName: "${typeAnnotation.typeName}"`;
  if (typeAnnotation.genericTypes && typeAnnotation.genericTypes.length > 0) {
    const elementType = typeAnnotation.genericTypes[0].typeName;
    typeInfo += `, elementType: "${elementType}"`;
  }
  typeInfo += " }";
  return typeInfo;
}
