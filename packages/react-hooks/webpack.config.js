const { merge } = require("webpack-merge");
const path = require("path");
const baseConfig = require("../../webpack/webpack.config.base.common.prod");
//const merge = require('webpack-merge')
module.exports = merge(baseConfig, {
  entry: path.resolve(__dirname, "./index.ts"),

  output: {
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    alias: {
      // @see https://github.com/lerna/lerna/issues/3006
      // hack to fix package leaks
      "@vulcanjs/mongo/client": "not_found",
      // @see https://github.com/lerna/lerna/issues/3006
      // hack to fix package leaks
      "@vulcanjs/crud": "not_found",
    },
  },
});
