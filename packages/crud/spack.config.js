const { config } = require("@swc/core/spack");

module.exports = config({
  entry: {
    // TODO: not sure how to have a "root" entry, for shared code
    shared: __dirname + "/index.ts",
    server: __dirname + "/server/index.ts",
  },
  output: {
    path: __dirname + "/dist",
  },
  module: {},
});
