import { RuntimeVal, NumberVal } from "./values.ts";
import {
  BinaryExpr,
  NumericLiteral,
  Program,
  Statement,
  Identifier,
  VarDeclaration
} from "../base/typeAst.ts";
import Environment from "./environment.ts";
import { eval_Identifier, eval_binary_expr } from "./eval/expressions.ts";
import { eval_program_expr, eval_var_declaration } from "./eval/evalStatements.ts";



export function evaluate(astNode: Statement, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: ((astNode as NumericLiteral).value),
        type: "number",
      } as NumberVal;
    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr, env);
    case "Identifier":
      return eval_Identifier(astNode as Identifier, env);
    case "Program":
      return eval_program_expr(astNode as Program, env);
    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);
    default:
      console.error(
        "Ast Node has not yet been set up for interpretation",
        astNode,
      );
      Deno.exit(0);
  }
}

