import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import-x';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
	{
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'**/dist-firefox/**',
			// Temporary folders zip.sh leaves behind when it stops on an error
			'**/band-play-build*/**',
		],
	},
	// A stale `eslint-disable` comment fails the run
	{
		linterOptions: {
			reportUnusedDisableDirectives: 'error',
		},
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	// Turns off stylistic rules that conflict with Prettier; must come before the rules below
	prettierConfig,
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			globals: {
				...globals.browser,
				chrome: 'readonly',
			},
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		plugins: {
			react,
			'react-hooks': reactHooks,
			import: importPlugin,
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			'linebreak-style': ['error', 'unix'],
			quotes: ['error', 'single', { avoidEscape: true }],
			semi: ['error', 'always'],
			curly: ['error', 'all'],
			'no-unused-vars': 'off',
			// `_name` marks a value that is unused on purpose (for example `catch (_e)`)
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'react/prop-types': 'off',
			'react/react-in-jsx-scope': 'off',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			'import/order': [
				'error',
				{
					groups: [
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
					],
					'newlines-between': 'always',
					alphabetize: { order: 'asc', caseInsensitive: true },
				},
			],
		},
	},
	// Extension code: type-aware checks for promises that are neither awaited nor handled
	{
		files: ['src/**/*.{ts,tsx}'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'@typescript-eslint/no-floating-promises': 'error',
			// React event props may return a promise; the handlers catch their own errors
			'@typescript-eslint/no-misused-promises': [
				'error',
				{ checksVoidReturn: { attributes: false } },
			],
		},
	},
	// Build config (CommonJS) and repository scripts run in Node
	{
		files: ['webpack/**/*.js', 'postcss.config.js', 'tailwind.config.js'],
		languageOptions: {
			globals: {
				...globals.node,
			},
			sourceType: 'commonjs',
		},
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
	{
		files: ['scripts/**/*.mjs', 'eslint.config.mjs'],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
];
