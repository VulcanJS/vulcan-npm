const merge = require("webpack-merge");
const path = require("path");
const commonConfig = require("./webpack.config.base.common.prod");
// @see https://webpack.js.org/guides/typescript/
module.exports = merge(commonConfig, {
  entry: "./index.server.ts",
  target: "node",
  output: {
    filename: "index.server.js",
  },
  resolve: {
    mainFiles: ["index.server.ts", "index.server.js", "index.ts", "index.js"],
  },
});
