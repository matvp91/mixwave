import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "@mixwave/artisan/producer":
      "<rootDir>/test/mocks/import-artisan-producer.ts",
  },
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.(mt|t|cj|j)s$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  prettierPath: require.resolve("jest-prettier"),
};
