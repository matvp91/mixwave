import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { loadConfigEnv } from "@mixwave/shared";

loadConfigEnv();

const MANUAL_CHUNKS = [
  "hls.js",
  "monaco-editor",
  "radix-ui",
  "react-syntax-highlighter",
];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: "PUBLIC_",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "lucide-react/icons": fileURLToPath(
        new URL("./node_modules/lucide-react/dist/esm/icons", import.meta.url),
      ),
    },
  },
  clearScreen: false,
  server: {
    port: 52000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          return MANUAL_CHUNKS.find((chunk) => id.includes(chunk));
        },
      },
    },
  },
});
