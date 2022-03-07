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
    // FIMXE: @see https://github.com/vercel/next.js/issues/35112 doesn't work when imported from server entrypoint
    format: ["cjs", "esm" /*, "iife"*/],
    outDir: "dist",
  },
]);
