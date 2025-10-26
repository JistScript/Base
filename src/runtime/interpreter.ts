import { RuntimeVal, NumberVal, StringValue, ArrayVal, ObjectVal } from "./values";
import {
  BinaryExpr,
  NumericLiteral,
  Program,
  Statement,
  Identifier,
  VarDeclaration,
  AssignmentExpr,
  ObjectLiteral,
  CallExpr,
  FunctionDeclaration,
  StringLiteral,
  ArrayLiteral,
  TypeAnnotation,
} from "../parser/typeAst.js";
import Environment from "./environment.js";
import {
  eval_Identifier,
  eval_assignment,
  eval_binary_expr,
  eval_object_expr,
  eval_array_literal,
} from "./eval/expressions.js";
import { eval_program_expr, eval_function_declaration } from "./eval/evalStatements.js";

export function evaluate(astNode: Statement, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: (astNode as NumericLiteral).value,
        type: "number",
      } as NumberVal;
    case "AssignmentExpr":
      return eval_assignment(astNode as AssignmentExpr, env);
    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr, env);
    case "Identifier":
      return eval_Identifier(astNode as Identifier, env);
    case "ObjectLiteral":
      return eval_object_expr(astNode as ObjectLiteral, env);
    case "ArrayLiteral":
      return eval_array_literal(astNode as ArrayLiteral, env);
    case "CallExpr":
      return eval_call_expr_with_types(astNode as CallExpr, env);
    case "Program":
      return eval_program_expr(astNode as Program, env);
    case "VarDeclaration":
      return eval_var_declaration_with_destructuring(astNode as VarDeclaration, env);
    case "StringLiteral":
      return {
        value: (astNode as StringLiteral).value,
        type: "string",
      } as StringValue;
    case "FunctionDeclaration":
      return eval_function_declaration(astNode as FunctionDeclaration, env);
    case "ReturnStatement": {
      const returnStmt = astNode as any;
      if (returnStmt.value) {
        const returnValue = evaluate(returnStmt.value, env);
        return {
          type: "return",
          value: returnValue,
        } as any;
      }
      return {
        type: "return",
        value: { type: "null", value: null } as any,
      } as any;
    }
    default:
      console.error("Ast Node has not yet been set up for interpretation", astNode);
      process.exit(1);
    // Deno.exit(1);
  }
}

function eval_call_expr_with_types(expr: CallExpr, env: Environment): RuntimeVal {
  const args = expr.args.map(arg => evaluate(arg, env));
  const fn = evaluate(expr.caller, env);
  if (expr.typeAnnotation) {
    const typeInfo = convertTypeAnnotation(expr.typeAnnotation);
    args.push(typeInfo as any);
  }
  if (fn.type == "native-fn") {
    const result = (fn as any).call(args, env);
    return result;
  }
  if (fn.type == "function") {
    const funct = fn as any;
    const scope = new Environment(funct.declarationEnv);
    for (let i = 0; i < funct.parameters.length; i++) {
      const varname = funct.parameters[i];
      scope.declareVar(varname, args[i], false);
    }
    let result: RuntimeVal = { type: "null", value: null } as any;
    for (const stmt of funct.body) {
      result = evaluate(stmt, scope);
      if (result && typeof result === "object" && (result as any).type === "return") {
        return (result as any).value;
      }
    }
    return result;
  }
  throw "Value that is not a function can't be called: " + JSON.stringify(fn);
}

function convertTypeAnnotation(typeAnnotation: TypeAnnotation): ObjectVal {
  const properties = new Map<string, RuntimeVal>();
  properties.set("typeName", {
    type: "string",
    value: typeAnnotation.typeName,
  } as StringValue);
  if (typeAnnotation.genericTypes && typeAnnotation.genericTypes.length > 0) {
    properties.set("elementType", {
      type: "string",
      value: typeAnnotation.genericTypes[0].typeName,
    } as StringValue);
  }
  return {
    type: "object",
    properties,
  } as ObjectVal;
}

function eval_var_declaration_with_destructuring(
  declaration: VarDeclaration,
  env: Environment
): RuntimeVal {
  if (declaration.destructuring && declaration.value) {
    const value = evaluate(declaration.value, env);
    if (value.type !== "array") {
      throw "Destructuring assignment requires an array";
    }
    const arr = value as ArrayVal;
    const elements = declaration.destructuring.elements;
    if (arr.elements.length < elements.length) {
      throw "Not enough elements for destructuring assignment";
    }
    for (let i = 0; i < elements.length; i++) {
      env.declareVar(elements[i].symbol, arr.elements[i], declaration.constant);
    }

    return value;
  }
  // Regular variable declaration //
  const value = declaration.value
    ? evaluate(declaration.value, env)
    : ({ type: "null", value: null } as any);

  return env.declareVar(declaration.identifier, value, declaration.constant);
}
