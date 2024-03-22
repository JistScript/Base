import Parser from "./base/parser.ts";
import { createGlobalEnv } from "./runTime/environment.ts";
import { evaluate } from "./runTime/interpreter.ts";
repl();

// Run time //
async function repl() {
  const parser = new Parser();
  const env = createGlobalEnv();
  // Run time //
  console.log("\nMark:1");
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
