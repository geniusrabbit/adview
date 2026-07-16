const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Force a single React 19 instance (avoid root React 18 from the monorepo)
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^react/jsx-runtime$': '<rootDir>/node_modules/react/jsx-runtime.js',
    '^react/jsx-dev-runtime$': '<rootDir>/node_modules/react/jsx-dev-runtime.js',
    '^react-dom/client$': '<rootDir>/node_modules/react-dom/client.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    // Point at package sources (core has no src/ folder)
    '^@adview/core$': '<rootDir>/../packages/core/index.ts',
    '^@adview/core/utils$': '<rootDir>/../packages/core/utils/index.ts',
    '^@adview/core/typings$': '<rootDir>/../packages/core/typings/index.ts',
    '^@adview/react$': '<rootDir>/../packages/react/src/index.ts',
    '^@adview/react/(.*)$': '<rootDir>/../packages/react/src/$1',
    '^typings$': '<rootDir>/../packages/core/typings/index.ts',
    '^typings/(.*)$': '<rootDir>/../packages/core/typings/$1',
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
