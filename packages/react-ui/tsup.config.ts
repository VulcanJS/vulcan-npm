import { defineConfig, Format } from "tsup";
import path from "path";

const commonConfig = {
  clean: true,
  splitting: false,
  // Skip until .d.ts.map is also supported https://github.com/egoist/tsup/issues/564
  // dts: true,
  sourcemap: true,
  tsconfig: path.resolve(__dirname, "./tsconfig.build.json"),
  outDir: "dist",
  format: ["esm" as Format],
};
export default defineConfig([
  /*
  FIXME: this splitted config won't work with context
  useVulcanComponents won't use the user-defined context, but it's own unitialized context for some reason
  as if a context was bundled
  Surprisingly, this won't happen with the old big bundle
  {
    entry: [
      // TODO: get more granular for components, namely SmartForm
      "./components/core/index.ts",
      "./components/form/index.ts",
      "./components/VulcanComponents/index.ts",
      "./components/VulcanCurrentUser/index.ts",
      "./componentsHelpers.tsx",
    ],
    ...commonConfig,
    // For debugging, will output ESbuild metafile
    // metafile: true,
    esbuildOptions(options, context) {
      // the directory structure will be the same as the source
      options.outbase = "./";
    },
  },
  {
    entry: ["index.ts"],
    ...commonConfig,
    esbuildOptions(options, context) {
      options.outbase = "./";
    },
    bundle: false,
  },*/
  {
    entry: ["index.ts"],
    ...commonConfig,
    esbuildOptions(options, context) {
      options.outbase = "./";
    },
  },
  // testing utils use a separated entry point
  {
    entry: ["testing.ts"],
    ...commonConfig,
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
