// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier/recommended";

export default [
  {
    ignores: ["dist/*"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
];
