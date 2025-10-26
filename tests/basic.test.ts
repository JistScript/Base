// import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
// import Parser from "../src/parser/parser.ts";
// import { createGlobalEnv } from "../src/runtime/environment.ts";
// import { evaluate } from "../src/runtime/interpreter.ts";
// import { transpileToJS } from "../src/compiler/transpiler.ts";

// Deno.test("Basic function test", () => {
//   const code = `
// function test(x, y) {
//   let result = x + y;
//   return result;
// }
// const result = test(10, 10);
// mark(result, "TestCase");
// `;

//   const parser = new Parser();
//   const env = createGlobalEnv();
//   const program = parser.proTypeAsst(code);
//   const output = evaluate(program, env);

//   // Should execute without errors
//   assertEquals(typeof output, "object");
// });

// Deno.test("Object literal test", () => {
//   const code = `
// const testCase = {
//   TestCase: "test1",
//   Number: 10,
//   Array: [1, 2, "Three"],
//   Boolean: true,
//   Null: null,
//   Undefined: undefined,
//   Object: {
//     simple: false
//   }
// };
// mark(testCase, "TestCase");
// `;

//   const parser = new Parser();
//   const env = createGlobalEnv();
//   const program = parser.proTypeAsst(code);
//   const output = evaluate(program, env);

//   assertEquals(typeof output, "object");
// });

// Deno.test("useState with String type", () => {
//   const code = `
// const [name, setName] = useState:String("John Doe");
// mark(name, "Initial name");
// setName("Jane Smith");
// mark(name, "Updated name");
// `;

//   const parser = new Parser();
//   const env = createGlobalEnv();
//   const program = parser.proTypeAsst(code);
//   const output = evaluate(program, env);

//   assertEquals(typeof output, "object");
// });

// Deno.test("useState with Number type", () => {
//   const code = `
// const [count, setCount] = useState:Number(0);
// mark(count, "Initial count");
// setCount(10);
// mark(count, "Updated count");
// `;

//   const parser = new Parser();
//   const env = createGlobalEnv();
//   const program = parser.proTypeAsst(code);
//   const output = evaluate(program, env);

//   assertEquals(typeof output, "object");
// });

// Deno.test("useState with Array type", () => {
//   const code = `
// const [flags, setFlags] = useState:Array(String, ["ready", "loading"]);
// mark(flags, "Initial flags");
// setFlags(["ready", "loading", "complete"]);
// mark(flags, "Updated flags");
// `;

//   const parser = new Parser();
//   const env = createGlobalEnv();
//   const program = parser.proTypeAsst(code);
//   const output = evaluate(program, env);

//   assertEquals(typeof output, "object");
// });

// Deno.test("useState with Object type", () => {
//   const code = `
// const [config, setConfig] = useState:Object({
//   simple: false,
//   retries: 3
// });
// mark(config, "Initial config");
// setConfig({
//   simple: true,
//   retries: 5
// });
// mark(config, "Updated config");
// `;

//   const parser = new Parser();
//   const env = createGlobalEnv();
//   const program = parser.proTypeAsst(code);
//   const output = evaluate(program, env);

//   assertEquals(typeof output, "object");
// });

// Deno.test("useState with Boolean type", () => {
//   const code = `
// const [active, setActive] = useState:Boolean(true);
// mark(active, "Is active");
// setActive(false);
// mark(active, "After toggle");
// `;

//   const parser = new Parser();
//   const env = createGlobalEnv();
//   const program = parser.proTypeAsst(code);
//   const output = evaluate(program, env);

//   assertEquals(typeof output, "object");
// });

// Deno.test("Transpiler - basic code", () => {
//   const code = `
// function add(a, b) {
//   return a + b;
// }
// const result = add(5, 3);
// mark(result);
// `;

//   const parser = new Parser();
//   const program = parser.proTypeAsst(code);
//   const jsCode = transpileToJS(program, { injectRuntime: true });

//   // Should contain runtime and transpiled code
//   assertEquals(jsCode.includes("// JistScript Runtime"), true);
//   assertEquals(jsCode.includes("function add"), true);
// });

// Deno.test("Transpiler - useState code", () => {
//   const code = `
// const [count, setCount] = useState:Number(0);
// `;

//   const parser = new Parser();
//   const program = parser.proTypeAsst(code);
//   const jsCode = transpileToJS(program, { injectRuntime: true });

//   // Should contain useState call with type info
//   assertEquals(jsCode.includes("useState"), true);
//   assertEquals(jsCode.includes("Number"), true);
// });
