import { defineConfig } from "tsup";
import path from "path";

const commonConfig = {
  clean: true,
  splitting: false,
  // Skip until .d.ts.map is also supported https://github.com/egoist/tsup/issues/564
  // dts: true,
  sourcemap: true,
  tsconfig: path.resolve(__dirname, "./tsconfig.build.json"),
};
export default defineConfig([
  {
    entry: ["index.ts"],
    ...commonConfig,
    // IMPORTANT: keep iife around so that CommonJS ends with .cjs
    format: ["cjs", "esm", "iife"],
    outDir: "dist",
  },
  // testing utils use a separated entry point
  {
    entry: ["testing.ts"],
    ...commonConfig,
    // IMPORTANT: keep iife around so that CommonJS ends with .cjs
    format: ["cjs", "esm", "iife"],
    outDir: "dist",
  },
  {
    entry: ["server/index.ts"],
    ...commonConfig,
    format: ["cjs"],
    outDir: "dist/server",
  },
  /*
  No client-specific code yet
  {
    entry: ["client/index.ts"],
    ...commonConfig,
    format: ["esm", "iife"],
    outDir: "dist/client",
  },*/
]);
