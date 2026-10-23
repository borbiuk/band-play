const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { merge } = require('webpack-merge');

const prod = require('./webpack.prod.js');

// Chrome production build with the bundle size report
module.exports = merge(prod, {
	plugins: [new BundleAnalyzerPlugin()],
});
