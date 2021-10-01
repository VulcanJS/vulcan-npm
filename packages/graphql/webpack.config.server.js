const merge = require("webpack-merge");
const path = require("path");
const baseConfig = require("../../webpack/webpack.config.base.server.prod");
//const merge = require('webpack-merge')
module.exports = merge(baseConfig, {
  entry: path.resolve(__dirname, "./server/index.ts"),
  output: {
    path: path.resolve(__dirname, "dist/server"),
  },
});
