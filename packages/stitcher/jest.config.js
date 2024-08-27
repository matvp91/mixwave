/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  moduleNameMapper: {
    "^@src(.*)$": "<rootDir>/src$1",
  },
  resolver: "jest-ts-webcompat-resolver",
};
