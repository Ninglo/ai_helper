import { Configuration } from "@rspack/cli";

module.exports = {
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "builtin:swc-loader",
        options: {
          jsc: {
            parser: {
              syntax: "typescript",
            },
          },
        },
        type: "javascript/auto",
      },
    ],
  },
  entry: { index: "./backend/index.ts" },
  resolve: {
    extensions: [".js", ".json", ".wasm", ".ts"],
  },
} satisfies Configuration;
