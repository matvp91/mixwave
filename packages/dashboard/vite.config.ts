import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { parseEnv } from "shared/env";

// When we inject new PUBLIC_ variables, make sure to add them
// in src/globals.d.ts too. All of these are optional because we
// can inject them through SSI.
const env = parseEnv((t) => ({
  PUBLIC_API_ENDPOINT: t.Optional(t.String()),
  PUBLIC_STITCHER_ENDPOINT: t.Optional(t.String()),
}));

const MANUAL_CHUNKS = [
  "hls.js",
  "monaco-editor",
  "radix-ui",
  "react-syntax-highlighter",
];

function ssiEnvPlugin(values: Record<string, string>) {
  return {
    name: "html-transform",
    transformIndexHtml(html) {
      Object.entries(values).forEach(([key, value]) => {
        html = html.replace(`<!--#echo var="${key}"-->`, value);
      });
      return html;
    },
  } satisfies Plugin;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), ssiEnvPlugin(env)],
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
    hmr: false,
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
