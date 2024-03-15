import { RuntimeVal, NEW_NULL } from "./../values.ts";
import { Program, VarDeclaration } from "../../base/typeAst.ts";
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
