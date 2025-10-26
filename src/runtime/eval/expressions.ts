import {
  ArrayLiteral,
  AssignmentExpr,
  BinaryExpr,
  Identifier,
  ObjectLiteral,
} from "../../parser/typeAst.js";
import Environment from "../environment.js";
import { evaluate } from "../interpreter.js";
import { NEW_NULL, NumberVal, RuntimeVal, ArrayVal, ObjectVal } from "../values.js";

export function eval_array_literal(astNode: ArrayLiteral, env: Environment): ArrayVal {
  const elements = astNode.elements.map(element => evaluate(element, env));
  return { type: "array", elements };
}

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

export function eval_binary_expr(binop: BinaryExpr, env: Environment): RuntimeVal {
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

export function eval_Identifier(ident: Identifier, env: Environment): RuntimeVal {
  const val = env.lookUpVar(ident.symbol);
  return val;
}

export function eval_assignment(node: AssignmentExpr, env: Environment): RuntimeVal {
  if (node.assigne.kind !== "Identifier")
    throw `Invalid assignment ${JSON.stringify(node.assigne)}`;
  const varname = (node.assigne as Identifier).symbol;
  return env.assignVar(varname, evaluate(node.value, env));
}

export function eval_object_expr(obj: ObjectLiteral, env: Environment): RuntimeVal {
  const object = { type: "object", properties: new Map() } as ObjectVal;
  for (const { key, value } of obj.properties) {
    const runtimeVal = value == undefined ? env.lookUpVar(key) : evaluate(value, env);
    object.properties.set(key, runtimeVal);
  }
  return object;
}
