const { FlatCompat } = require('@eslint/eslintrc');
const unicorn = require('eslint-plugin-unicorn');
const tseslint = require('typescript-eslint');
const prettierEslint = require('eslint-plugin-prettier');

const compat = new FlatCompat({
  baseDirectory: __dirname, // Use __dirname in CommonJS
});

module.exports = tseslint.config([
  {
    ignores: ['dist/*'],
  },
  ...compat.extends(['prettier', 'eslint-config-prettier']),
  {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      project: './tsconfig.json',
    },
    extends: ['plugin:@typescript-eslint/recommended'],
    plugins: {
      '@typescript-eslint': tseslint,
      unicorn,
      prettier: prettierEslint,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
]);
