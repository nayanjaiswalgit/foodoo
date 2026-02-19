// Root ESLint flat config — covers the whole monorepo.
// Per-app configs (apps/mobile, apps/delivery) extend this via their own eslint.config.js.
// apps/web-admin already has its own eslint.config.js (Vite-generated, kept as-is).
// apps/api uses the "api" block below.
//
// Run from repo root:  pnpm exec eslint apps/api/src --ext ts

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // ── Global ignores ────────────────────────────────────────────────────────
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.expo/**',
    '**/.turbo/**',
    '**/android/**',
    '**/ios/**',
    'pnpm-lock.yaml',
  ]),

  // ── Base TypeScript rules (all TS/TSX files in the repo) ─────────────────
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      // Warn on unused vars but allow underscore-prefixed to be ignored
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Allow empty catch blocks with a comment
      'no-empty': ['error', { allowEmptyCatch: false }],
      // Consistent type imports (reduces bundle confusion)
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },

  // ── API (Express + Node.js, CommonJS) ────────────────────────────────────
  {
    files: ['apps/api/src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        // projectService picks up tsconfig automatically — no path needed
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Express route handlers often use async without explicit return
      '@typescript-eslint/no-floating-promises': 'warn',
      // Avoid accidental any leaking from Express typings
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow namespace for Express type augmentation
      '@typescript-eslint/no-namespace': 'off',
    },
  },

  // ── Shared package (pure TypeScript, ESNext) ─────────────────────────────
  {
    files: ['packages/shared/src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  // ── Config / script files at repo root (JS, CJS, MJS) ────────────────────
  {
    files: ['*.config.{js,mjs,cjs}', '*.config.ts', 'turbo.json'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]);
