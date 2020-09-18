// @see https://webpack.js.org/guides/typescript/
// TODO: run with Babel, see electron-react-boilerplate example
// of Babel +  Webpack
/**
 * Examples of Babel +  Webpack + TS-loader
 * https://github.com/microsoft/TypeScriptSamples/blob/master/react-flux-babel-karma/webpack.config.js
 *
 */

const path = require("path");
const nodeExternals = require("webpack-node-externals");
module.exports = {
  devtool: "inline-source-map",
  mode: "production",
  output: {
    libraryTarget: "commonjs2",
    filename: "index.js",
  },
  externals: [
    nodeExternals({
      additionalModuleDirs: [path.resolve(__dirname, "../node_modules")],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              plugins: [
                [
                  "transform-define",
                  {
                    "process.env.NODE_ENV": "production",
                    window: "42",
                  },
                ],
              ],
            },
          },
          { loader: "ts-loader" },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".jsx", ".ts", ".js"],
    alias: {
      "isomorphic-unfetch": "cross-fetch",
    },
  },
};
