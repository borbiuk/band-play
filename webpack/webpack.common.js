const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

module.exports = {
	entry: {
		options: path.join(srcDir, 'options', 'options.tsx'),
		background: path.join(srcDir, 'background', 'background.ts'),
		content: path.join(srcDir, 'content', 'content.ts'),
		downloads: path.join(srcDir, 'downloads', 'downloads.tsx'),
	},
	output: {
		path: path.join(rootDir, 'dist'),
		// Manifests reference exact file names, so no hashes are used
		filename: '[name].js',
		clean: true,
	},
	optimization: {
		// Every entry is a single self-contained file (no vendor chunks, no runtime chunk)
		splitChunks: false,
		runtimeChunk: false,
		moduleIds: 'deterministic',
	},
	cache: {
		type: 'filesystem',
		buildDependencies: {
			config: [__filename],
		},
		cacheDirectory: path.join(rootDir, 'node_modules', '.cache', 'webpack'),
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							// Type checking is done by `tsc --noEmit` (npm run typecheck)
							transpileOnly: true,
							compilerOptions: {
								noEmit: false,
							},
						},
					},
				],
			},
			{
				test: /\.s[ac]ss$/i,
				exclude: /node_modules/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							importLoaders: 2,
							sourceMap: false,
						},
					},
					// Plugins come from postcss.config.js
					'postcss-loader',
					{
						loader: 'sass-loader',
						options: {
							sassOptions: {
								style: 'compressed',
							},
						},
					},
				],
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.json'],
		alias: {
			'@shared': path.join(srcDir, 'shared'),
		},
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{
					from: '.',
					to: './',
					context: path.join(rootDir, 'public'),
					globOptions: {
						ignore: [
							'**/logo-full.png',
							'**/logo.png',
							'**/.DS_Store',
							// Manifests are copied as manifest.json by the per-target configs
							'**/manifest.json',
							'**/manifest.firefox.json',
						],
					},
				},
			],
		}),
	],
	// Browser extension specific settings
	target: ['web', 'es2021'],
};
