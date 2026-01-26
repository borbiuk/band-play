import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default [
	js.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			globals: {
				...globals.browser,
				chrome: 'readonly',
				NodeJS: 'readonly',
			},
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		plugins: {
			'@typescript-eslint': typescriptEslint,
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
			indent: ['off'],
			'linebreak-style': ['error', 'unix'],
			quotes: ['error', 'single'],
			semi: ['error', 'always'],
			'no-unused-vars': ['off'],
			'@typescript-eslint/no-unused-vars': ['warn'],
			'@typescript-eslint/no-explicit-any': ['warn'],
			'@typescript-eslint/no-non-null-assertion': ['warn'],
			'react/prop-types': ['off'],
			'react/react-in-jsx-scope': ['off'],
			'react-hooks/exhaustive-deps': ['warn'],
			'import/order': ['error', {
				'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
				'newlines-between': 'always',
				'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
			}],
		},
	},
	{
		ignores: ['**/node_modules/**', '**/dist/**', '**/webpack/**'],
	},
];
