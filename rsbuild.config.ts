import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: { index: "./frontend/index.tsx" },
  },
  output: {
    sourceMap: {
      js: "source-map",
    },
  },
});
