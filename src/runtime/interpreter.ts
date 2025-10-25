import { RuntimeVal, NumberVal, StringValue } from "./values";
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
} from "../parser/typeAst";
import Environment from "./environment";
import {
  eval_Identifier,
  eval_assignment,
  eval_binary_expr,
  eval_object_expr,
  eval_call_expr,
  eval_array_literal,
} from "./eval/expressions";
import {
  eval_program_expr,
  eval_var_declaration,
  eval_function_declaration,
} from "./eval/evalStatements";

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
      return eval_call_expr(astNode as CallExpr, env);
    case "Program":
      return eval_program_expr(astNode as Program, env);
    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);
    case "StringLiteral":
      return {
        value: (astNode as StringLiteral).value,
        type: "string",
      } as StringValue;
    case "FunctionDeclaration":
      return eval_function_declaration(astNode as FunctionDeclaration, env);
    default:
      console.error(
        "Ast Node has not yet been set up for interpretation",
        astNode
      );
      process.exit(1);
  }
}
