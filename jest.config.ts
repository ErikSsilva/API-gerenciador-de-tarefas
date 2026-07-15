import type {Config} from 'jest';

const config: Config = {
  bail: false,
  clearMocks: true,

  collectCoverage: true,

  coverageDirectory: "coverage",

  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/server.ts",
    "!src/routes/index.ts"
  ],

  coverageProvider: "v8",

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  preset: "ts-jest",

  testEnvironment: "node",

  testMatch: ["<rootDir>/src/**/*.test.ts"],

};

export default config;
