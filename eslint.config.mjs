import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import-x';
import playwright from 'eslint-plugin-playwright';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// One project service for every type-aware block (typescript-eslint keeps a single instance)
const typedParserOptions = {
	projectService: {
		allowDefaultProject: ['playwright.config.ts'],
	},
	tsconfigRootDir: import.meta.dirname,
};

export default [
	{
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'**/dist-firefox/**',
			'**/test-results/**',
			'**/playwright-report/**',
			'**/test-results-live/**',
			'**/playwright-report-live/**',
			// Temporary folders zip.sh leaves behind when it stops on an error
			'**/band-play-build*/**',
			// Design prototypes and the style guide (plain browser pages, not extension code)
			'design/**',
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
			parserOptions: typedParserOptions,
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
	// Layers: an entrypoint folder imports only shared/ (never another entrypoint), and shared/ imports none of them
	...['shared', 'content', 'background', 'options', 'downloads'].map(
		(area) => ({
			files: [`src/${area}/**/*.{ts,tsx}`],
			rules: {
				'no-restricted-imports': [
					'error',
					{
						patterns: [
							{
								group: [
									'content',
									'background',
									'options',
									'downloads',
								]
									.filter((other) => other !== area)
									.map((other) => `**/${other}/**`),
								message:
									'Entrypoint folders do not import each other, and shared/ imports none of them: move the code to src/shared/.',
							},
						],
					},
				],
			},
		})
	),
	// Tests: Node globals, type-aware check for missing awaits, Playwright rules
	{
		files: ['tests/**/*.ts', 'playwright.config.ts'],
		languageOptions: {
			globals: {
				...globals.node,
			},
			parserOptions: typedParserOptions,
		},
		rules: {
			'@typescript-eslint/no-floating-promises': 'error',
			// Playwright fixtures call `use()`, which is not the React hook
			'react-hooks/rules-of-hooks': 'off',
		},
	},
	{
		files: ['tests/**/*.ts'],
		...playwright.configs['flat/recommended'],
		rules: {
			...playwright.configs['flat/recommended'].rules,
			'playwright/no-wait-for-timeout': 'error',
			'playwright/no-page-pause': 'error',
			'playwright/no-focused-test': 'error',
			'playwright/no-conditional-expect': 'error',
			'playwright/no-conditional-in-test': 'error',
			'playwright/no-element-handle': 'error',
			'playwright/no-eval': 'error',
			'playwright/no-force-option': 'error',
			'playwright/no-wait-for-selector': 'error',
			'playwright/no-wait-for-navigation': 'error',
			'playwright/no-networkidle': 'error',
			'playwright/no-skipped-test': ['error', { allowConditional: true }],
			'playwright/no-nth-methods': 'warn',
			'playwright/require-to-pass-timeout': 'warn',
			'playwright/no-commented-out-tests': 'warn',
			'playwright/prefer-to-have-count': 'error',
			'playwright/prefer-web-first-assertions': 'error',
		},
	},
	// Node scripts of the tests (snapshot capture)
	{
		files: ['tests/**/*.mjs'],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
	// Build config (CommonJS) and repository scripts run in Node
	{
		files: [
			'webpack/**/*.js',
			'postcss.config.js',
			'tailwind.config.js',
			'src/**/tailwind.config.js',
		],
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
