module.exports = {
  collectCoverageFrom: ["src/**/*.js"],
  coverageReporters: ["html", "lcov"],
    coverageThreshold: {
    global: {
      branches: 99,
      functions: 99,
      lines: 99,
    },
  },
  testEnvironment: "node",
  testMatch: ["<rootDir>/test/*(*.)+(spec|test).js?(x)"]
};
