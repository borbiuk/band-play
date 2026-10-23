const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');

const rootDir = path.join(__dirname, '..');

// Development build for Chrome (dist/), rebuilt on file changes
module.exports = merge(common, {
	mode: 'development',
	cache: { name: 'dev' },
	devtool: 'cheap-module-source-map',
	optimization: {
		minimize: false,
	},
	stats: {
		colors: true,
		modules: false,
		children: false,
		chunks: false,
		chunkModules: false,
	},
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
