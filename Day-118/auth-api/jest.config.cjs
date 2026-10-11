// jest.config.cjs

module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/app.js',
    '!src/server.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
  ],
  testTimeout: 10000,
  verbose: true,
  // Run tests sequentially (in-memory DB is shared!)
  maxWorkers: 1,
  // Force exit after all tests complete
  forceExit: true,
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
};