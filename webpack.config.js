const path = require('path');

module.exports = {
  entry: './includes/public/js/travelersmap.ts',
  output: {
    filename: 'travelersmap-bundle.js',
    path: path.resolve(__dirname, './includes/public/js/dist'),
    iife: false,
  },
  devtool: "source-map",
  optimization: {
    minimize: false,
  },
  resolve: {
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      { test: /\.js$/, loader: "source-map-loader" },
    ],
  },
  mode: 'production',
};
