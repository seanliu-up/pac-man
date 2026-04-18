export default {
  testEnvironment: 'jsdom',
  setupFiles: ['jest-canvas-mock'],
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: [
    'src/game/**/*.js',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 80,
    },
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/rendering/',
    'src/game/state/game-loop.js',
  ],
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js',
  ],
};
