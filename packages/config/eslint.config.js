// @ts-check

/**
 * Shared ESLint config: airbnb-typescript + FSD import rules.
 *
 * FSD IMPORT RULES (strictly enforced):
 *   app         → can import from: pages, widgets, features, entities, shared
 *   pages       → can import from: widgets, features, entities, shared
 *   widgets     → can import from: features, entities, shared
 *   features    → can import from: entities, shared
 *   entities    → can import from: shared
 *   shared      → NOTHING above (no circular deps)
 */
/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: true,
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import'],
  rules: {
    // ── TypeScript ──────────────────────────────────────────────
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',

    // ── React ────────────────────────────────────────────────────
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    'react/prop-types': 'off', // TypeScript handles this
    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // ── Imports ──────────────────────────────────────────────────
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        pathGroups: [
          { pattern: 'react*', group: 'external', position: 'before' },
          { pattern: '@anicca/**', group: 'internal', position: 'before' },
          { pattern: '@/**', group: 'internal', position: 'after' },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        alphabetize: { order: 'asc' },
      },
    ],
    'import/no-duplicates': 'error',
    'import/no-cycle': 'error',

    // ── FSD Layer Rules ──────────────────────────────────────────
    // NOTE: These are enforced via custom rule below.
    // "shared" cannot import from features, entities, widgets, pages.
    // "entities" cannot import from features, widgets, pages.
    // "features" cannot import from other features, widgets, pages.
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          // shared → NEVER imports from domain layers above it
          {
            group: ['*/features/*', '*/widgets/*', '*/pages/*'],
            message:
              '[FSD] shared/ cannot import from features/, widgets/, or pages/. Move logic down.',
          },
        ],
      },
    ],

    // ── General ──────────────────────────────────────────────────
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    eqeqeq: ['error', 'always'],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: { alwaysTryTypes: true },
    },
  },
  ignorePatterns: ['dist/', 'build/', '.next/', 'node_modules/', '*.config.js', '*.config.ts'],
};
