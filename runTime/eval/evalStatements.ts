import { RuntimeVal, NEW_NULL, FunctionVal } from "./../values.ts";
import {
  FunctionDeclaration,
  Program,
  VarDeclaration,
} from "../../base/typeAst.ts";
import Environment from "./../environment.ts";
import { evaluate } from "../interpreter.ts";

export function eval_program_expr(
  program: Program,
  env: Environment
): RuntimeVal {
  let lastEvaluated: RuntimeVal = NEW_NULL();
  for (const statements of program.body) {
    lastEvaluated = evaluate(statements, env);
  }
  return lastEvaluated;
}

export function eval_var_declaration(
  declaration: VarDeclaration,
  env: Environment
): RuntimeVal {
  const value = declaration.value
    ? evaluate(declaration.value, env)
    : NEW_NULL();
  return env.declareVar(declaration.identifier, value, declaration.constant);
}

export function eval_function_declaration(
  declaration: FunctionDeclaration,
  env: Environment
): RuntimeVal {
  const fn = {
    type: "function",
    name: declaration.name,
    parameters: declaration.parameters,
    declarationEnv: env,
    body: declaration.body,
  } as FunctionVal;
  return env.declareVar(declaration.name, fn, true);
}
