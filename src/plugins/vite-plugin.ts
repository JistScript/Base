import { Plugin } from "vite";
import Parser from "../parser/parser";
import { transpileToJS } from "../compiler/transpiler";

export function jistscript(): Plugin {
  return {
    name: "vite-plugin-jistscript",
    // Handle .jts and .jtx files //
    transform(code: string, id: string) {
      if (!id.endsWith(".jts") && !id.endsWith(".jtx")) {
        return null;
      }
      try {
        const parser = new Parser();
        const ast = parser.proTypeAsst(code);
        const jsCode = transpileToJS(ast, {
          target: "esnext",
          module: "esm",
          injectRuntime: true,
        });
        return {
          code: jsCode,
          map: null,
        };
      } catch (error) {
        const err = error as Error;
        this.error(`Error compiling ${id}: ${err.message}`);
      }
    },
  };
}

export default jistscript;
