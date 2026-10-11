const path = require("path");

function resolveFrom(appDir, extraAlias = {}) {
  return {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@marketscope/ui": path.resolve(appDir, "../../packages/ui/src/index.ts"),
      "@marketscope/types": path.resolve(appDir, "../../packages/types/src/index.ts"),
      ...extraAlias,
    },
  };
}

function rechartsAlias(appDir) {
  // The shared chart imports recharts. Each app resolves its own copy so
  // es-toolkit stays inside that build, where its package exports can resolve.
  return {
    recharts: path.resolve(appDir, "node_modules/recharts"),
  };
}

function rules({ includeGlobalCss = false } = {}) {
  const cssModule = {
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
  };

  const loaders = [
    {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: "ts-loader",
    },
    cssModule,
  ];

  if (includeGlobalCss) {
    loaders.push({
      test: /\.css$/,
      exclude: /\.module\.css$/,
      use: ["style-loader", "css-loader"],
    });
  }

  return loaders;
}

module.exports = { resolveFrom, rechartsAlias, rules };
