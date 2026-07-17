import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';

/**
 * Minimal flat config for the monorepo.
 * Type-aware project linting is intentionally off so package `examples/`,
 * build output, and tooling configs do not fail CI with parser project errors.
 */
export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/examples/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.css.d.ts',
      'test-project/**',
      '**/*.{js,cjs,mjs}',
      'eslint.config.*',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
  },
);
