const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');

const base = require('./webpack.prod.base.js');

const rootDir = path.join(__dirname, '..');

// Production build for Firefox (dist-firefox/) with the Firefox manifest
module.exports = merge(base, {
	cache: { name: 'firefox' },
	output: {
		path: path.join(rootDir, 'dist-firefox'),
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{
					from: path.join(rootDir, 'public', 'manifest.firefox.json'),
					to: 'manifest.json',
				},
			],
		}),
	],
});
