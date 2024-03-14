import Parser from "./base/parser.ts";
import { evaluate } from "./runTime/interpreter.ts";

repl();

async function repl() {
  const parser = new Parser();
  console.log("\nRepl V1");
  while (true) {
    const input = prompt("> ");
    if (!input || input.includes("exist")) {
      Deno.exit(1);
    }
    const program = parser.proTypeAsst(input);
    const results = evaluate(program);
    console.log(results);
  }
}
