import { FlatCompat } from '@eslint/eslintrc';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';
import prettierEslint from 'eslint-plugin-prettier';
import tsParser from '@typescript-eslint/parser'; // Added TypeScript parser

const __dirname = new URL('.', import.meta.url).pathname;
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config([
  {
    ignores: ['dist/*'],
  },
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      unicorn,
      prettier: prettierEslint,
    },
  },
]);
