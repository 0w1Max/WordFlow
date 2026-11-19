import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**',
      '.dependency-refresh/**',
      'test-results/**',
      'playwright-report/**'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }] }
  },
  {
    files: ['public/app/**/*.js'],
    languageOptions: { sourceType: 'module', globals: globals.browser }
  }
];
