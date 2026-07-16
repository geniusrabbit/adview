/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@adview/core$': '<rootDir>/../core/index.ts',
    '^@adview/core/utils$': '<rootDir>/../core/utils/index.ts',
    '^@adview/core/typings$': '<rootDir>/../core/typings/index.ts',
    '^typings$': '<rootDir>/../core/typings/index.ts',
    '^typings/(.*)$': '<rootDir>/../core/typings/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          module: 'commonjs',
          moduleResolution: 'node',
          isolatedModules: true,
          skipLibCheck: true,
        },
      },
    ],
  },
  clearMocks: true,
};
