import { defineConfig } from "tsup";
import path from "path";

const commonConfig = {
  clean: true,
  //splitting: false,
  // Skip until .d.ts.map is also supported https://github.com/egoist/tsup/issues/564
  // dts: true,
  sourcemap: true,
  tsconfig: path.resolve(__dirname, "./tsconfig.build.json"),
};
export default defineConfig([
  // actual exposed modules = 1 per component
  {
    // This is a demo with one component but you can use a glob here
    entry: ["./components/core/*.tsx"],
    //["./components/core/Loading.tsx"],
    ...commonConfig,
    format: ["esm"],
    // TODO: it's not respect automatically
    outDir: "dist/components/core",
  },
  {
    // This is a demo with one component but you can use a glob here
    entry: ["./components/VulcanComponents/liteVulcanComponents/index.ts"],
    //["./components/core/Loading.tsx"],
    ...commonConfig,
    format: ["esm"],
    // TODO: it's not respect automatically
    outDir: "dist/components/VulcanComponents/liteVulcanComponents",
  },
  // index files to allow named imports
  // inspired by react-bootstrap structure
  {
    entry: ["index.ts", "./components/core/index.ts"],
    ...commonConfig,
    // index files must NOT be bundled!
    // it acts as a map towards bundled components
    // but never rebundles them
    bundle: false,
    format: ["esm"],
    outDir: "dist",
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
