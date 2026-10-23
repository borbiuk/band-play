const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');

const base = require('./webpack.prod.base.js');

const rootDir = path.join(__dirname, '..');

// Production build for Chrome (dist/)
module.exports = merge(base, {
	cache: { name: 'chrome' },
	plugins: [
		new CopyPlugin({
			patterns: [
				{
					from: path.join(rootDir, 'public', 'manifest.json'),
					to: 'manifest.json',
				},
			],
		}),
	],
});
