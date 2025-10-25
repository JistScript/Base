import Parser from "../parser/parser";
import { transpileToJS } from "../compiler/transpiler";

export default function jistscriptLoader(source: string) {
  const callback = this.async();
  try {
    const parser = new Parser();
    const ast = parser.proTypeAsst(source);
    const jsCode = transpileToJS(ast, {
      target: "esnext",
      module: "esm"
    });
    callback(null, jsCode);
  } catch (error) {
    callback(error);
  }
}
