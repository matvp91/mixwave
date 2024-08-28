/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
    "^.+.js$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    "^@src(.*)$": "<rootDir>/src$1",
    "@mixwave/artisan/(.*)": "<rootDir>/test/mocks/mock-artisan.ts",
  },
  resolver: "jest-ts-webcompat-resolver",
  setupFiles: ["./test/setupTests.ts"],
};
