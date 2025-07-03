module.exports = {
  collectCoverageFrom: ["src/**/*.js"],
  coverageReporters: ["html", "lcov"],
    coverageThreshold: {
    global: {
      branches: 72.6,
      functions: 82.9,
      lines: 79.0,
    },
  },
  testEnvironment: "node",
  testMatch: ["<rootDir>/test/*(*.)+(spec|test).js?(x)"]
};
