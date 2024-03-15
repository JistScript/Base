import { AssignmentExpr, BinaryExpr, Identifier } from "../../base/typeAst.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { NEW_NULL, NumberVal, RuntimeVal } from "../values.ts";

function eval_numeric_binary_expr(
  leftHandSide: NumberVal,
  rightHandSide: NumberVal,
  operator: string
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

export function eval_binary_expr(
  binop: BinaryExpr,
  env: Environment
): RuntimeVal {
  const leftHandSide = evaluate(binop.left, env);
  const rightHandSide = evaluate(binop.right, env);
  if (leftHandSide.type == "number" && rightHandSide.type == "number") {
    return eval_numeric_binary_expr(
      leftHandSide as NumberVal,
      rightHandSide as NumberVal,
      binop.operator
    );
  }
  return NEW_NULL();
}

export function eval_Identifier(
  ident: Identifier,
  env: Environment
): RuntimeVal {
  const val = env.lookUpVar(ident.symbol);
  return val;
}

export function eval_assignment(
  node: AssignmentExpr,
  env: Environment
): RuntimeVal {
  if (node.assigne.kind !== "Identifier")
    throw `Invalid assignment ${JSON.stringify(node.assigne)}`;
   const varname = (node.assigne as Identifier).symbol;
   return env.assignVar(varname, evaluate(node.value, env));
}
