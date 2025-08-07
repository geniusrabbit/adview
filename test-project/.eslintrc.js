module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Custom ESLint rules can be added here
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    'react-hooks/exhaustive-deps': 'warn',
  },
}
