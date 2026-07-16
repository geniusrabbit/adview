/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^typings$': '<rootDir>/typings/index.ts',
    '^typings/(.*)$': '<rootDir>/typings/$1',
  },
  clearMocks: true,
};
