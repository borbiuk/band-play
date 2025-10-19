const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = merge(common, {
	devtool: 'cheap-module-source-map', // Змінюємо devtool для service worker
	mode: 'development',
	optimization: {
		// Відключаємо мінімізацію в dev режимі
		minimize: false,
		// Швидша збірка в dev режимі
		removeAvailableModules: false,
		removeEmptyChunks: false,
		// В dev режимі відключаємо splitChunks для уникнення конфліктів
		splitChunks: false,
	},
	// Швидше перезавантаження при змінах
	watchOptions: {
		ignored: /node_modules/,
		aggregateTimeout: 300,
		poll: 1000,
	},
	// Статистика збірки
	stats: {
		colors: true,
		modules: false,
		children: false,
		chunks: false,
		chunkModules: false,
	},
	plugins: [
		// Створюємо dev manifest без vendor.js
		new CopyPlugin({
			patterns: [
				{
					from: path.join(__dirname, '../public/manifest.json'),
					to: path.join(__dirname, '../dist/manifest.json'),
					transform(content) {
						const manifest = JSON.parse(content.toString());
						// Видаляємо vendor.js з content_scripts для dev режиму
						manifest.content_scripts[0].js = ['content.js'];
						return JSON.stringify(manifest, null, 2);
					},
				},
			],
		}),
	],
});
