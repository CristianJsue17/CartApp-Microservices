module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '*-service/src/**/*.js',
    '!*-service/src/config/**',
    '!**/node_modules/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 2,
      functions: 2,
      lines: 2,
      statements: 2
    }
  },
  verbose: true
};