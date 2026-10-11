const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "src/index.tsx"),
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "auto",
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@marketscope/ui": path.resolve(__dirname, "../../packages/ui/src/index.ts"),
      "@marketscope/types": path.resolve(__dirname, "../../packages/types/src/index.ts"),
      "@marketscope/watchlist-client": path.resolve(
        __dirname,
        "../../packages/watchlist-client/src/index.ts",
      ),
      // The shared chart imports recharts. Use this app's copy so es-toolkit
      // stays inside the build, where its package exports can resolve.
      recharts: path.resolve(__dirname, "node_modules/recharts"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: /\.module\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                namedExport: false,
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"),
    }),
    new ModuleFederationPlugin({
      name: "markets",
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
    port: 3001,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
};
