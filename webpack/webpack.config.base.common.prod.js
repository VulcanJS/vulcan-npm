const path = require("path");
// @see https://webpack.js.org/guides/typescript/
// TODO: run with Babel, see electron-react-boilerplate example
// of Babel +  Webpack
module.exports = {
  devtool: "inline-source-map",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".jsx", ".ts", ".js"],
  },
};
