import {
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  Identifier,
  ObjectLiteral,
} from "../../base/typeAst.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import {
  FunctionVal,
  NEW_NULL,
  NativeFnVal,
  NumberVal,
  ObjectVal,
  RuntimeVal,
} from "../values.ts";

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

export function eval_object_expr(
  obj: ObjectLiteral,
  env: Environment
): RuntimeVal {
  const object = { type: "object", properties: new Map() } as ObjectVal;
  for (const { key, value } of obj.properties) {
    const runtimeVal =
      value == undefined ? env.lookUpVar(key) : evaluate(value, env);
    object.properties.set(key, runtimeVal);
  }
  return object;
}

export function eval_call_expr(expr: CallExpr, env: Environment): RuntimeVal {
  const args = expr.args.map((arg) => evaluate(arg, env));
  const fn = evaluate(expr.caller, env);
  if (fn.type == "native-fn") {
    const result = (fn as NativeFnVal).call(args, env);
    return result;
  }
  if (fn.type == "function") {
    const funct = fn as FunctionVal;
    const scope = new Environment(funct.declarationEnv);
    // variable for parameter //
    for (let i = 0; i < funct.parameters.length; i++) {
      //! verify function arity //
      const varname = funct.parameters[i];
      scope.declareVar(varname, args[i], false);
    }
    let result: RuntimeVal = NEW_NULL();
    for (const stmt of funct.body) {
      result = evaluate(stmt, scope);
    }
    return result;
  }
  throw "Value that is not a function can't be rendered" + JSON.stringify(fn);
}
