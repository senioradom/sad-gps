const path = require('path');

const config = require('./site.config');
const loaders = require('./webpack.loaders');
const plugins = require('./webpack.plugins');

module.exports = () => ({
    context: path.join(config.root, config.paths.src),
    // entry: ['@babel/polyfill/noConflict', './js/app/app-map.js'],
    entry: [
        '@babel/polyfill/noConflict',
        // './js/index.js',
        './js/app/app-map.js',
        // path.join(config.root, config.paths.src, 'styles/main.scss')
    ],
    output: {
        library: 'SadGPS',
        libraryExport: 'default',
        libraryTarget: 'umd',
        path: path.join(config.root, config.paths.dist),
        filename: 'sad-gps.js',
    },
    mode: ['production', 'development'].includes(config.env) ? config.env : 'development',

    // Crashes IE 11
    // devtool: 'cheap-eval-source-map',
    devtool: 'none',

    devServer: {
        contentBase: path.join(config.root, config.paths.src),
        watchContentBase: true,
        hot: true,
        open: true,
        port: config.port,
        host: config.dev_host,
    },
    module: {
        rules: loaders,
    },
    plugins,
});
