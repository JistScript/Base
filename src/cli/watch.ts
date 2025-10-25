import { watch as fsWatch } from "node:fs";

interface JistConfig {
  compilerOptions?: {
    outDir?: string;
    rootDir?: string;
  };
  include?: string[];
  exclude?: string[];
}

type CompileFunction = (filePath: string, config: JistConfig) => boolean;

export function watch(config: JistConfig, compileFn: CompileFunction) {
  const patterns = config.include || ["src/**/*.jts", "src/**/*.jtx"];
  const rootDir = config.compilerOptions?.rootDir || "./src";

  console.log(`👀 Watching for file changes in ${rootDir}...\n`);

  // Watch the root directory recursively //
  const watcher = fsWatch(rootDir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    // Check if file matches .jts or .jtx extensions //
    if (!filename.endsWith(".jts") && !filename.endsWith(".jtx")) {
      return;
    }
    const exclude = config.exclude || ["node_modules", "dist"];
    const isExcluded = exclude.some(pattern => filename.includes(pattern));
    if (isExcluded) return;
    const fullPath = `${rootDir}/${filename}`;
    if (eventType === "change" || eventType === "rename") {
      console.log(`\n File changed: ${filename}`);

      try {
        const success = compileFn(fullPath, config);
        if (success) {
          console.log(`Recompiled successfully`);
        }
      } catch (error) {
        console.error(`Compilation failed:`, error.message);
      }
    }
  });

  // Handle Ctrl+C gracefully //
  process.on("SIGINT", () => {
    console.log("\n\n Stopping watch mode...");
    watcher.close();
    process.exit(0);
  });

  // Initial compilation //
  console.log("Running initial compilation...\n");

  // Keep the process alive //
  process.stdin.resume();
}
