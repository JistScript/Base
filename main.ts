import Parser from "./src/parser/parser";
import { createGlobalEnv } from "./src/runtime/environment";
import { evaluate } from "./src/runtime/interpreter";
repl();

// Run time //
async function repl() {
  const parser = new Parser();
  const env = createGlobalEnv();
  console.log("\nMark:1");
  while (true) {
    const input = prompt("> ");
    if (!input || input.includes("exit")) {
      process.exit(1);
      // Deno.exit(1);
    }
    const program = parser.proTypeAsst(input);
    const results = evaluate(program, env);
  }
}
