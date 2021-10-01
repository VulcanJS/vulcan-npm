const merge = require("webpack-merge");
const path = require("path");
const baseConfig = require("../../webpack/webpack.config.base.client.prod");

module.exports = merge(baseConfig, {
  entry: path.resolve(__dirname, "./client/index.ts"),
  output: {
    // NOTE: @vulcanjs/mongo is a server-first package, so to get isomorphic code you need to import @vulcanjs/mongo/client
    path: path.resolve(__dirname, "dist/client"),
  },
});
