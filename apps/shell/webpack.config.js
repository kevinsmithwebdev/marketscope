const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const { resolveFrom, rules } = require("../../tooling/webpack-app");

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "src/index.tsx"),
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  resolve: resolveFrom(__dirname),
  module: {
    rules: rules({ includeGlobalCss: true }),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"),
    }),
    new ModuleFederationPlugin({
      name: "shell",
      remotes: {
        markets: "markets@http://localhost:3001/remoteEntry.js",
        crypto: "cryptoApp@http://localhost:3002/remoteEntry.js",
        economy: "economy@http://localhost:3003/remoteEntry.js",
        watchlist: "watchlist@http://localhost:3004/remoteEntry.js",
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
    port: 3000,
    historyApiFallback: true,
  },
};
