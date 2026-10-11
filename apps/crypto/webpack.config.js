const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const { rechartsAlias, resolveFrom, rules } = require("../../tooling/webpack-app");

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "src/index.tsx"),
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "auto",
    clean: true,
  },
  resolve: resolveFrom(__dirname, {
    "@marketscope/watchlist-client": path.resolve(
      __dirname,
      "../../packages/watchlist-client/src/index.ts",
    ),
    ...rechartsAlias(__dirname),
  }),
  module: {
    rules: rules(),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"),
    }),
    new ModuleFederationPlugin({
      name: "cryptoApp",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/App.tsx",
      },
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: "^19.3.0",
        },
        "react-dom": {
          singleton: true,
          eager: true,
          requiredVersion: "^19.3.0",
        },
      },
    }),
  ],
  devServer: {
    port: 3002,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
};
