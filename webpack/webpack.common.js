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
		clean: true,
		// For Chrome Extensions, do not use hashed file names
		// because manifest.json references exact file names
	},
	optimization: {
		splitChunks: {
			chunks(chunk) {
				// Background script must not include vendor dependencies (service worker)
				if (chunk.name === 'background') {
					return false;
				}
				// Only the content script should include vendor dependencies
				return chunk.name === 'content';
			},
			minSize: 20000,
			maxSize: 244000,
			cacheGroups: {
				// Vendor libraries only for content scripts
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendor',
						// Extract vendor only from the 'content' entry
						// to avoid splitting the popup (options) and requiring vendor.js in options.html
						chunks: (chunk) => chunk.name === 'content',
					priority: 10,
					enforce: true,
				},
			},
		},
		usedExports: true,
		sideEffects: false,
		moduleIds: 'deterministic',
		runtimeChunk: false, // Runtime chunk is not needed for extensions
	},
	cache: {
		type: 'filesystem',
		buildDependencies: {
			config: [__filename],
		},
		cacheDirectory: path.resolve(__dirname, '../node_modules/.cache/webpack'),
		compression: 'gzip',
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							transpileOnly: true,
							experimentalWatchApi: true,
							compilerOptions: {
								noEmit: false,
							},
						},
					},
				],
				exclude: /node_modules/,
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							importLoaders: 2,
							sourceMap: false,
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									'tailwindcss',
									'autoprefixer',
									'postcss-preset-env',
								],
							},
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sassOptions: {
								outputStyle: 'compressed',
							},
						},
					},
				],
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.json'],
		plugins: [
			new TsconfigPathsPlugin({
				configFile: './tsconfig.json',
			})
		],
		// Cache modules for faster resolution
		cacheWithContext: false,
		// Aliases for faster access
		alias: {
			'@shared': path.resolve(__dirname, '../src/shared'),
		},
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
						'**/manifest.json', // Exclude manifest.json from common
						],
					},
					// Caching for faster copy
					noErrorOnMissing: true,
				},
			],
			options: {
				concurrency: 100,
			},
		}),
	],
	// Chrome Extension specific settings
	target: ['web', 'es2020'], // Support modern browsers
	experiments: {
		topLevelAwait: true, // Enable top-level await for service workers
	},
};
