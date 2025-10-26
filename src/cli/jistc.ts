import { parseArgs } from "node:util";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { glob } from "glob";
import Parser from "../parser/parser";
import { transpileToJS } from "../compiler/transpiler";
import { watch } from "./watch";

interface CompilerOptions {
  outDir?: string;
  rootDir?: string;
  watch?: boolean;
  sourcemap?: boolean;
  declaration?: boolean;
  jsx?: "react" | "react-jsx" | "preserve";
  target?: "es5" | "es6" | "esnext";
  module?: "commonjs" | "esm";
}

interface JistConfig {
  compilerOptions?: CompilerOptions;
  include?: string[];
  exclude?: string[];
}

function loadConfig(configPath = "jistconfig.json"): JistConfig {
  if (!existsSync(configPath)) {
    return {
      compilerOptions: {
        outDir: "./dist",
        rootDir: "./src",
        target: "esnext",
        module: "esm",
      },
      include: ["src/**/*.jts", "src/**/*.jtx"],
      exclude: ["node_modules/**", "dist/**"],
    };
  }

  const configContent = readFileSync(configPath, "utf-8");
  return JSON.parse(configContent);
}

function compile(filePath: string, config: JistConfig) {
  const content = readFileSync(filePath, "utf-8");
  const parser = new Parser();
  try {
    const ast = parser.proTypeAsst(content);
    const jsCode = transpileToJS(ast, config.compilerOptions || {});
    // Determine output path //
    const rootDir = config.compilerOptions?.rootDir || "./src";
    const outDir = config.compilerOptions?.outDir || "./dist";
    const relativePath = relative(rootDir, filePath);
    const outputPath = join(outDir, relativePath)
      .replace(/\.jts$/, ".js")
      .replace(/\.jtx$/, ".jsx");
    // Ensure output directory exists //
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    writeFileSync(outputPath, jsCode);
    console.log(`Compiled: ${filePath} → ${outputPath}`);

    return true;
  } catch (error) {
    console.error(`Error compiling ${filePath}:`, error.message);
    return false;
  }
}

function compileAll(config: JistConfig) {
  const patterns = config.include || ["src/**/*.jts", "src/**/*.jtx"];
  const exclude = config.exclude || ["node_modules/**", "dist/**"];
  let files: string[] = [];
  for (const pattern of patterns) {
    const matched = glob.sync(pattern, { ignore: exclude });
    files = files.concat(matched);
  }
  console.log(`Found ${files.length} files to compile\n`);
  let successCount = 0;
  let errorCount = 0;
  for (const file of files) {
    if (compile(file, config)) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  console.log(`\nCompiled ${successCount} files successfully`);
  if (errorCount > 0) {
    console.log(`${errorCount} files had errors`);
  }
}

// Main CLI //
const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    watch: { type: "boolean", short: "w" },
    project: { type: "string", short: "p" },
    outDir: { type: "string" },
    help: { type: "boolean", short: "h" },
    version: { type: "boolean", short: "v" },
    init: { type: "boolean" },
  },
  allowPositionals: true,
});

if (values.version) {
  console.log("JistScript Compiler v1.0.0");
  process.exit(0);
}

if (values.help) {
  console.log(`
JistScript Compiler (jistc) - Like TypeScript Compiler (tsc)

Usage:
  jistc [options] [files...]

Options:
  -w, --watch           Watch mode - recompile on file changes
  -p, --project   Path to jistconfig.json
  --outDir        Output directory
  --init                Create jistconfig.json
  -h, --help            Show help
  -v, --version         Show version

Examples:
  jistc                 # Compile all files in jistconfig.json
  jistc --watch         # Watch and recompile on changes
  jistc file.jts        # Compile specific file
  jistc --init          # Create jistconfig.json
  `);
  process.exit(0);
}

if (values.init) {
  const defaultConfig: JistConfig = {
    compilerOptions: {
      outDir: "./dist",
      rootDir: "./src",
      target: "esnext",
      module: "esm",
      sourcemap: true,
      jsx: "react-jsx",
    },
    include: ["src/**/*.jts", "src/**/*.jtx"],
    exclude: ["node_modules", "dist"],
  };
  writeFileSync("jistconfig.json", JSON.stringify(defaultConfig, null, 2));
  console.log("✓ Created jistconfig.json");
  process.exit(0);
}

// Load config //
const configPath = values.project || "jistconfig.json";
const config = loadConfig(configPath);
// Override config with CLI options //
if (values.outDir) {
  config.compilerOptions = config.compilerOptions || {};
  config.compilerOptions.outDir = values.outDir;
}
// Compile specific files or all files //
if (positionals.length > 0) {
  for (const file of positionals) {
    compile(file, config);
  }
} else {
  // Compile all files //
  if (values.watch) {
    console.log("Starting watch mode...\n");
    watch(config, compile);
  } else {
    compileAll(config);
  }
}
