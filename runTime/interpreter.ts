import { RuntimeVal, NumberVal, NEW_NULL } from "./values.ts";
import {
  BinaryExpr,
  NumericLiteral,
  Program,
  Statement,
  Identifier,
} from "../base/typeAst.ts";
import Environment from "./environment.ts";

function eval_program_expr(program: Program, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = NEW_NULL();
  for (const statements of program.body) {
    lastEvaluated = evaluate(statements, env);
  }
  return lastEvaluated;
}

function eval_numeric_binary_expr(
  leftHandSide: NumberVal,
  rightHandSide: NumberVal,
  operator: string,
): NumberVal {
  let result: number;
  if (operator == "+") {
    result = leftHandSide.value + rightHandSide.value;
  } else if (operator == "-") {
    result = leftHandSide.value - rightHandSide.value;
  } else if (operator == "*") {
    result = leftHandSide.value * rightHandSide.value;
  } else if (operator == "/") {
    result = leftHandSide.value / rightHandSide.value;
  } else {
    result = leftHandSide.value % rightHandSide.value;
  }
  return { value: result, type: "number" };
}

function eval_binary_expr(binop: BinaryExpr, env: Environment): RuntimeVal {
  const leftHandSide = evaluate(binop.left, env);
  const rightHandSide = evaluate(binop.right, env);
  if (leftHandSide.type == "number" && rightHandSide.type == "number") {
    return eval_numeric_binary_expr(
      leftHandSide as NumberVal,
      rightHandSide as NumberVal,
      binop.operator,
    );
  }
  return NEW_NULL();
}

function eval_Identifier(ident: Identifier, env: Environment): RuntimeVal {
  const val = env.lookUpVar(ident.symbol);
  return val;
}

export function evaluate(astNode: Statement, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: (astNode as NumericLiteral).value,
        type: "number",
      } as NumberVal;
    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr, env);
    case "Identifier":
      return eval_Identifier(astNode as Identifier, env);
    case "Program":
      return eval_program_expr(astNode as Program, env);
    default:
      console.error(
        "Ast Node has not yet been set up for interpretation",
        astNode,
      );
      Deno.exit(0);
  }
}
