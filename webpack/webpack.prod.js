const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = merge(common, {
	mode: 'production',
	devtool: false, // Disable source maps in production
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				parallel: true,
				terserOptions: {
					compress: {
						drop_console: true,
						drop_debugger: true,
						pure_funcs: ['console.log', 'console.info', 'console.debug'],
						passes: 2,
					},
					format: {
						comments: false,
					},
					mangle: {
						safari10: true,
					},
				},
				extractComments: false,
			}),
			new CssMinimizerPlugin({
				parallel: true,
				minimizerOptions: {
					preset: [
						'default',
						{
							discardComments: { removeAll: true },
						},
					],
				},
			}),
		],
		// Additional optimizations
		concatenateModules: true,
		flagIncludedChunks: true,
		providedExports: true,
		usedExports: true,
		sideEffects: false,
	},
	performance: {
		hints: 'warning',
		// Chrome Extensions have file size limits
		maxEntrypointSize: 2000000, // 2MB for entry points
		maxAssetSize: 2000000, // 2MB for assets
		// Additional settings for extensions
		assetFilter: function(assetFilename) {
			return !assetFilename.endsWith('.map');
		},
	},
	plugins: [
		// Copy manifest.json for production
		new CopyPlugin({
			patterns: [
				{
					from: path.join(__dirname, '../public/manifest.json'),
					to: path.join(__dirname, '../dist/manifest.json'),
				},
			],
		}),
	],
});
