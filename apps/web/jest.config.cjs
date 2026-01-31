const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  // Node 18+ provides Request/Response/ReadableStream for API route tests; jsdom would require many polyfills
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/e2e/", "<rootDir>/.next/"],
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  // p-limit and yocto-queue are ESM-only; transform them so scrape route tests can load lib/zip
  transformIgnorePatterns: ["/node_modules/(?!p-limit|yocto-queue)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: ["**/*.{ts,tsx}", "!**/*.d.ts", "!**/.next/**", "!**/node_modules/**"],
};

module.exports = createJestConfig(customJestConfig);

