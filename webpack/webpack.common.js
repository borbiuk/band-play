const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const srcDir = path.join(__dirname, '..', 'src');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
	entry: {
		options: path.join(srcDir, './options/options.tsx'),
		background: path.join(srcDir, './background/background.ts'),
		content: path.join(srcDir, './content/content.ts'),
	},
	output: {
		path: path.join(__dirname, './../dist'),
		filename: '[name].js',
	},
	optimization: {
		splitChunks: {
			name: 'vendor',
			chunks(chunk) {
				return chunk.name !== 'background';
			},
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendor',
					chunks: 'all',
					enforce: true,
				},
				react: {
					test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
					name: 'react',
					chunks: 'all',
					enforce: true,
				},
			},
		},
		usedExports: true,
		sideEffects: false,
	},
	cache: {
		type: 'filesystem',
		buildDependencies: {
			config: [__filename],
		},
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: { plugins: ['postcss-preset-env'] },
						},
					},
				],
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
		plugins: [
			new TsconfigPathsPlugin({
				configFile: './tsconfig.json',
			})
		],
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{
					from: '.',
					to: './',
					context: 'public',
					globOptions: {
						gitignore: true,
						ignore: [
							'**/logo-full.png',
							'**/logo.png',
							'**/.DS_Store',
						],
					},
				},
			],
		}),
	],
};
