const { merge } = require("webpack-merge");
const path = require("path");
const baseConfig = require("../../webpack/webpack.config.base.common.prod");
//const merge = require('webpack-merge')
module.exports = merge(baseConfig, {
  entry: {
    index: path.resolve(__dirname, "./index.ts"),
    testing: path.resolve(__dirname, "./testing.ts"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
});
