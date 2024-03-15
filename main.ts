import Parser from "./base/parser.ts";
import Environment from "./runTime/environment.ts";
import { evaluate } from "./runTime/interpreter.ts";
import { NumberVal, NEW_NUM, NEW_NULL, NEW_BOOL } from "./runTime/values.ts";

repl();

async function repl() {
  const parser = new Parser();
  const env = new Environment();
  // default global variables //
  env.declareVar("null", NEW_NULL(), true);
  env.declareVar("true", NEW_BOOL(true), true);
  env.declareVar("false", NEW_BOOL(false), true);
  console.log("\nRepl V1");
  while (true) {
    const input = prompt("> ");
    if (!input || input.includes("exist")) {
      Deno.exit(1);
    }
    const program = parser.proTypeAsst(input);
    const results = evaluate(program, env);
    console.log(results);
  }
}
