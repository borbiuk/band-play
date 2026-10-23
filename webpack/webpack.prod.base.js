const TerserPlugin = require('terser-webpack-plugin');
const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');

// Production settings shared by the Chrome and Firefox builds (without the manifest)
module.exports = merge(common, {
	mode: 'production',
	devtool: false,
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				parallel: true,
				terserOptions: {
					compress: {
						drop_console: true,
						drop_debugger: true,
						pure_funcs: [
							'console.log',
							'console.info',
							'console.debug',
						],
						passes: 2,
					},
					format: {
						comments: false,
					},
				},
				extractComments: false,
			}),
		],
	},
	performance: {
		hints: 'warning',
		maxEntrypointSize: 2000000,
		maxAssetSize: 2000000,
		assetFilter: (assetFilename) => !assetFilename.endsWith('.map'),
	},
});
