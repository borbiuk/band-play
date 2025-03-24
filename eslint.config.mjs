import { defineConfig, globalIgnores } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import react from 'eslint-plugin-react';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import reactHooks from 'eslint-plugin-react-hooks';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});
import importPlugin from 'eslint-plugin-import';

export default defineConfig([globalIgnores(['**/node_modules', '**/dist', '**/webpack']), {
	extends: compat.extends(
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended'
	),

	plugins: {
		'@typescript-eslint': typescriptEslint,
		import: importPlugin,
		react,
		'react-hooks': reactHooks,
	},

	languageOptions: {
		globals: {
			...globals.browser,
		},

		parser: tsParser,
		ecmaVersion: 'latest',
		sourceType: 'module',
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
		'@typescript-eslint/no-unused-vars': ['off'],
	},
}]);
