const merge = require("webpack-merge");
const commonConfig = require("./webpack.config.base.common.prod");
// @see https://webpack.js.org/guides/typescript/
module.exports = merge(commonConfig, {
  entry: "./index.client.ts",
  output: {
    filename: "index.client.js",
  },
  resolve: {
    mainFiles: ["index.client.ts", "index.client.js", "index.ts", "index.js"],
  },
});
