import Parser from "./base/parser.ts";
import { createGlobalEnv } from "./runTime/environment.ts";
import { evaluate } from "./runTime/interpreter.ts";
// repl();

// test //
fire("./tests/test1.txt");

async function fire(filename: string) {
  const parser = new Parser();
  const env = createGlobalEnv();
  // Run time //
  const input = await Deno.readTextFile(filename);
  const program = parser.proTypeAsst(input);
  const result = evaluate(program, env);
  // console.log(result);
}

async function repl() {
  const parser = new Parser();
  const env = createGlobalEnv();
  // Run time //
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
