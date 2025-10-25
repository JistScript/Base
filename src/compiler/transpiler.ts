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
  // Mark function runtime  //
  const runtime =
    options.injectRuntime !== false
      ? `// JistScript Runtime
const mark = typeof window !== 'undefined' && window.console
  ? (...args) => console.log('[JistScript]', ...args)
  : (...args) => console.log('[JistScript]', ...args);
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
