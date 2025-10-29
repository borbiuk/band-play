const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = merge(common, {
	devtool: 'cheap-module-source-map', // Adjust devtool for service worker
	mode: 'development',
	optimization: {
		// Disable minimization in dev mode
		minimize: false,
		// Faster builds in dev mode
		removeAvailableModules: false,
		removeEmptyChunks: false,
		// Disable splitChunks in dev mode to avoid conflicts
		splitChunks: false,
	},
	// Faster reloads on file changes
	watchOptions: {
		ignored: /node_modules/,
		aggregateTimeout: 300,
		poll: 1000,
	},
	// Build statistics output
	stats: {
		colors: true,
		modules: false,
		children: false,
		chunks: false,
		chunkModules: false,
	},
	plugins: [
		// Create dev manifest without vendor.js
		new CopyPlugin({
			patterns: [
				{
					from: path.join(__dirname, '../public/manifest.json'),
					to: path.join(__dirname, '../dist/manifest.json'),
					transform(content) {
						const manifest = JSON.parse(content.toString());
						// Remove vendor.js from content_scripts for dev mode
						manifest.content_scripts[0].js = ['content.js'];
						return JSON.stringify(manifest, null, 2);
					},
				},
			],
		}),
	],
});
