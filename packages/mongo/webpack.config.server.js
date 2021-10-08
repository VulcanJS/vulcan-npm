const merge = require("webpack-merge");
const path = require("path");
const baseConfig = require("../../webpack/webpack.config.base.server.prod");

module.exports = merge(baseConfig, {
  entry: path.resolve(__dirname, "./index.ts"),
  output: {
    // NOTE: @vulcanjs/mongo is a server-first package, so here the default build is server
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    alias: {
      // @see https://github.com/lerna/lerna/issues/3006
      // hack to fix package leaks
      "@vulcanjs/graphql/server": "not_found",
    },
  },
});
