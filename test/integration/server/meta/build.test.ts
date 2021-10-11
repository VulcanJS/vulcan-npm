import fs from "fs";
import path from "path";

const packagesRoot = "../../../../packages";
const packagesPath = path.resolve(__dirname, packagesRoot);
const packageNames = fs.readdirSync(packagesPath);
test("build packages are not leaking other packages", () => {
  // Please run this test only after a build "yarn run build"
  /**
   *
   * You may end up with a build folder like this:
   * ```
   * dist/mongo/...
   * dist/graphql/...
   * dist/your-package/...
   * ```
   * instead of just having your package code.
   *
   * You mistakenly imported local code from another package, like importing from `../graphql` instead of `@vulcanjs/graphql` in `@vulcanjs/mongo`. Find the culprit import and fix them will repair the build.
   *
   * If your import are correct and you still have this issue, this also seems to unexpectedly affect "@vulcanjs/mongo/client" (client entrypoint) as well.
   * In this case, set a false webpack alias for the faulty package (see react-hooks for instance)
   */
  packageNames.forEach((packageName) => {
    const distFolderPath = path.resolve(packagesPath, packageName, "dist");
    try {
      const distFolders = fs.readdirSync(distFolderPath);
      expect(distFolders).not.toContain(packageName);
    } catch (err) {
      console.error(err);
      throw new Error(
        "Please run `yarn run build` before running integration tests."
      );
    }
  });
});
