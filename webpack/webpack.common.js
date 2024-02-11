const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const srcDir = path.join(__dirname, '..', 'src');

module.exports = {
	entry: {
		popup: path.join(srcDir, './popup/popup.tsx'),
		background: path.join(srcDir, './background.ts'),
		content: path.join(srcDir, './content.tsx'),
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
							'**/buymeacoffee-original.png',
							'**/configuration-original.png',
							'**/logo-full.png',
							'**/logo.png',
							'**/rate-original.png',
							'**/.DS_Store',
						],
					},
				},
			],
		}),
	],
};
