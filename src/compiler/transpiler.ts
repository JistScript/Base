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
} from "../parser/typeAst";

interface TranspileOptions {
  target?: "es5" | "es6" | "esnext";
  module?: "commonjs" | "esm";
  jsx?: "react" | "react-jsx" | "preserve";
  sourcemap?: boolean;
  injectRuntime?: boolean;
}

export function transpileToJS(ast: Program, options: TranspileOptions = {}): string {
  const ctx = new TranspileContext(options);
  const programCode = transpileProgram(ast, ctx);

  // State management runtime //
  const runtime =
    options.injectRuntime !== false
      ? `// JistScript Runtime
const mark = typeof window !== 'undefined' && window.console
  ? (...args) => console.log('[JistScript]', ...args)
  : (...args) => console.log('[JistScript]', ...args);

// State management system
const __jist_state_counter = { value: 0 };
const __jist_state_store = new Map();
const __jist_component_states = new Map();

function useState(initialValue, typeInfo) {
  const stateId = __jist_state_counter.value++;

  if (!__jist_state_store.has(stateId)) {
    __jist_state_store.set(stateId, initialValue);
  }

  const currentValue = __jist_state_store.get(stateId);

  const setState = (newValue) => {
    if (typeInfo && !validateType(newValue, typeInfo)) {
      console.warn(\`[JistScript] Type mismatch: expected \${typeInfo.type}, got \${typeof newValue}\`);
    }
    __jist_state_store.set(stateId, newValue);
    return newValue;
  };

  return [currentValue, setState];
}

function validateType(value, typeInfo) {
  switch (typeInfo.type) {
    case 'String':
      return typeof value === 'string';
    case 'Number':
      return typeof value === 'number';
    case 'Boolean':
      return typeof value === 'boolean';
    case 'Array':
      if (!Array.isArray(value)) return false;
      if (typeInfo.elementType) {
        return value.every(item => validateType(item, { type: typeInfo.elementType }));
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

  return runtime + programCode;
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

function transpileProgram(program: Program, ctx: TranspileContext): string {
  const statements = program.body.map(stmt => transpileStatement(stmt, ctx));
  return statements.join("\n");
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
      ctx.indent++;
      const body = fn.body.map(s => transpileStatement(s, ctx)).join("\n");
      ctx.indent--;
      return `${indent}function ${fn.name}(${params}) {\n${body}\n${indent}}`;
    }

    case "AssignmentExpr":
    case "BinaryExpr":
    case "CallExpr":
    case "Identifier":
    case "NumericLiteral":
    case "StringLiteral":
    case "ArrayLiteral":
    case "ObjectLiteral":
    case "MemberExpr":
      return `${indent}${transpileExpression(stmt as Expression, ctx)};`;

    default:
      return `${indent}/* Unsupported: ${stmt.kind} */`;
  }
}

function transpileExpression(expr: Expression, ctx: TranspileContext): string {
  switch (expr.kind) {
    case "NumericLiteral":
      return String((expr as any).value);

    case "StringLiteral":
      return `"${(expr as any).value}"`;

    case "Identifier":
      return (expr as any).symbol;

    case "BinaryExpr": {
      const bin = expr as BinaryExpr;
      const left = transpileExpression(bin.left, ctx);
      const right = transpileExpression(bin.right, ctx);
      return `${left} ${bin.operator} ${right}`;
    }

    case "AssignmentExpr": {
      const assign = expr as AssignmentExpr;
      const left = transpileExpression(assign.assigne, ctx);
      const right = transpileExpression(assign.value, ctx);
      return `${left} = ${right}`;
    }

    case "CallExpr": {
      const call = expr as CallExpr;
      const caller = transpileExpression(call.caller, ctx);
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
      const obj = transpileExpression(member.object, ctx);
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
  let typeInfo = `{ type: "${typeAnnotation.typeName}"`;
  if (typeAnnotation.genericTypes && typeAnnotation.genericTypes.length > 0) {
    const elementType = typeAnnotation.genericTypes[0].typeName;
    typeInfo += `, elementType: "${elementType}"`;
  }

  typeInfo += " }";
  return typeInfo;
}
