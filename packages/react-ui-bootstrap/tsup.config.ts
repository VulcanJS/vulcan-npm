import { defineConfig, Format } from "tsup";
import path from "path";

const commonConfig = {
  clean: true,
  // Skip until .d.ts.map is also supported https://github.com/egoist/tsup/issues/564
  // dts: true,
  sourcemap: true,
  tsconfig: path.resolve(__dirname, "./tsconfig.build.json"),
  outDir: "dist",
  format: ["esm" as Format],
};
export default defineConfig([
  {
    entry: [
      "./components/core/!(index).ts?(x)",
      "./components/VulcanComponents/!(index).ts?(x)",
      "./components/form/inputs/!(index).ts?(x)",
    ],
    ...commonConfig,
    esbuildOptions(options, context) {
      // the directory structure will be the same as the source
      options.outbase = "./";
    },
  },
  {
    entry: [
      "./index.ts",
      "./components/core/index.ts",
      "./components/VulcanComponents/index.ts",
      "./components/form/inputs/index.ts",
      "./components/form/index.ts",
    ],
    ...commonConfig,
    esbuildOptions(options, context) {
      // the directory structure will be the same as the source
      options.outbase = "./";
    },
    // index files must NOT be bundled!
    // it acts as a map towards bundled components
    // but never rebundles them
    bundle: false,
  },
  /*
  There is no server/client specific code in this package yet,
  every component is isomorphic (work on client and server)
  {
    entry: ["server/index.ts"],
    ...commonConfig,
    format: ["cjs"],
    outDir: "dist/server",
  },
  {
    entry: ["client/index.ts"],
    ...commonConfig,
    format: ["esm", "iife"],
    outDir: "dist/client",
  },*/
]);
