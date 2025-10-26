export { default as Parser } from "./parser/parser.js";
export { tokenize, TokenType } from "./parser/lexer.js";
export type { Token } from "./parser/lexer.js";
export { evaluate } from "./runtime/interpreter.js";
export { createGlobalEnv } from "./runtime/environment.js";
export { default as Environment } from "./runtime/environment.js";

// Export types //
export type * from "./parser/typeAst.js";
export type * from "./runtime/values.js";

// Compiler //
export { transpileToJS } from "./compiler/transpiler.js";

// Main API //
export class JistScript {}
