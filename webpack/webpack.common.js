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
		// Для Chrome Extension не використовуємо hash в іменах файлів
		// оскільки manifest.json посилається на конкретні імена
	},
	optimization: {
		splitChunks: {
			chunks(chunk) {
				// Background script не повинен мати vendor dependencies (service worker)
				if (chunk.name === 'background') {
					return false;
				}
				// Тільки content script має vendor dependencies
				return chunk.name === 'content';
			},
			minSize: 20000,
			maxSize: 244000,
			cacheGroups: {
				// Vendor бібліотеки тільки для content scripts
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendor',
					chunks: 'all',
					priority: 10,
					enforce: true,
				},
			},
		},
		usedExports: true,
		sideEffects: false,
		moduleIds: 'deterministic',
		runtimeChunk: false, // Для extension не потрібен runtime chunk
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
		// Кешування модулів для швидшої резолюції
		cacheWithContext: false,
		// Аліаси для швидшого доступу
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
							'**/manifest.json', // Виключаємо manifest.json з common
						],
					},
					// Кешування для швидшої копії
					noErrorOnMissing: true,
				},
			],
			options: {
				concurrency: 100,
			},
		}),
	],
	// Специфічні налаштування для Chrome Extension
	target: ['web', 'es2020'], // Підтримка сучасних браузерів
	experiments: {
		topLevelAwait: true, // Підтримка top-level await для service workers
	},
};
