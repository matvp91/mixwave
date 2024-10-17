import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      tsconfigPath: "./tsconfig.app.json",
    }),
    react(),
    svgr(),
  ],
  build: {
    emptyOutDir: false,
    lib: {
      entry: {
        index: resolve(__dirname, "src/facade/index.ts"),
        react: resolve(__dirname, "src/react/index.tsx"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "hls.js"],
    },
  },
  clearScreen: false,
});
