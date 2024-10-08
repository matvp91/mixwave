import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: "./test/globalSetup.ts",
  },
});
