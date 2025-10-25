export { default as Parser } from "./parser/parser";
export { tokenize, TokenType } from "./parser/lexer";
export type { Token } from "./parser/lexer";
export { evaluate } from "./runtime/interpreter";
export { createGlobalEnv } from "./runtime/environment";
export { default as Environment } from "./runtime/environment";

// Export types //
export type * from "./parser/typeAst";
export type * from "./runtime/values";

// Compiler //
export { transpileToJS } from "./compiler/transpiler";

// Main API //
export class JistScript {}
