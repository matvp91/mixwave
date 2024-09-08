import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dts({
      insertTypesEntry: true,
    }),
    react(),
    svgr(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "lib/main.ts"),
      name: "MixwaveHLSjs",
      fileName: "main",
    },
    rollupOptions: {
      external: ["react", "hls.js"],
    },
  },
  clearScreen: false,
  server: {
    port: 52005,
  },
});
