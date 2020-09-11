// @see https://webpack.js.org/guides/typescript/
// TODO: run with Babel, see electron-react-boilerplate example
// of Babel +  Webpack
module.exports = {
  devtool: "inline-source-map",
  mode: "production",
  output: {
    libraryTarget: "commonjs2",
    filename: "index.js",
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
