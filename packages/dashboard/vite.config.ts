import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// Use shared env, but below we set the envPrefix to ensure no
// secrets are being leaked to the client.
import "@mixwave/shared/env";

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
          if (id.includes("@mixwave/hls.js")) {
            return "hlsjs";
          }
          if (id.includes("@scalar")) {
            return "scalar";
          }
          if (id.includes("monaco-editor")) {
            return "monaco-editor";
          }
        },
      },
    },
  },
});
