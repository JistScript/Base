import { RuntimeVal, NumberVal, NullVal } from "./values.ts";
import {
  BinaryExpr,
  NumericLiteral,
  Program,
  Statement,
} from "../base/typeAst.ts";

function eval_program_expr(program: Program): RuntimeVal {
  let lastEvaluated: RuntimeVal = { type: "null", value: "null" } as NullVal;
  for (const statements of program.body) {
    lastEvaluated = evaluate(statements);
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

function eval_binary_expr(binop: BinaryExpr): RuntimeVal {
  const leftHandSide = evaluate(binop.left);
  const rightHandSide = evaluate(binop.right);
  if (leftHandSide.type == "number" && rightHandSide.type == "number") {
    return eval_numeric_binary_expr(
      leftHandSide as NumberVal,
      rightHandSide as NumberVal,
      binop.operator,
    );
  }
  return { type: "null", value: "null" } as NullVal;
}

export function evaluate(astNode: Statement): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: (astNode as NumericLiteral).value,
        type: "number",
      } as NumberVal;
    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr);
    case "Program":
      return eval_program_expr(astNode as Program);
    case "NullLiteral":
      return { value: "null", type: "null" } as NullVal;
    default:
      console.error(
        "Ast Node has not yet been set up for interpretation",
        astNode,
      );
      Deno.exit(0);
  }
}
