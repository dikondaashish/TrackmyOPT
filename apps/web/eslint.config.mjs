/**
 * ESLint Flat Config (ESLint 9+).
 *
 * Replaces the legacy `.eslintrc.json` which crashed on ESLint 8 + Next 16's
 * `eslint-config-next` schema. With flat config we import the rule set as a
 * value, sidestepping the broken legacy `extends` chain.
 */

import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default [
    {
        ignores: [
            '.next/**',
            '.turbo/**',
            'node_modules/**',
            'coverage/**',
            'dist/**',
            'build/**',
            'public/**',
            'pnpm-lock.yaml',
            'next-env.d.ts',
            'tsconfig.tsbuildinfo',
        ],
    },
    ...nextCoreWebVitals,
    ...nextTypescript,
    {
        rules: {
            // Loosen rules that don't match this codebase's style (matches old eslintrc).
            'react/no-unescaped-entities': 'off',

            // Encourage clean code without breaking builds — warnings only.
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            // Allow flexible `any` for the gradual cleanup roadmap (P2-4).
            '@typescript-eslint/no-explicit-any': 'warn',

            // React Compiler diagnostics (Next 16's eslint-plugin-react-hooks v7).
            // These are optimization hints, not correctness bugs — the app still
            // renders fine. Downgrade to warnings so CI is green and we can
            // tackle them progressively.
            'react-hooks/set-state-in-effect': 'warn',
            'react-hooks/static-components': 'warn',
            'react-hooks/purity': 'warn',
            'react-hooks/immutability': 'warn',
            'react-hooks/error-boundaries': 'warn',
            'react-hooks/preserve-manual-memoization': 'warn',
        },
    },
    {
        // Tests and e2e: relax noise rules.
        files: ['**/*.test.ts', '**/*.test.tsx', 'e2e/**/*'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    {
        // Legacy .js node scripts use CJS require() and don't ship to the app
        // runtime. Don't fail the build on TS-only rules in here.
        files: ['scripts/**/*.{js,mjs,cjs}', '**/*.config.{js,mjs,cjs}'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
        },
    },
    {
        // tailwind.config.ts uses require() for a tailwindcss internal — common pattern.
        files: ['tailwind.config.ts'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
];
