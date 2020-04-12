const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

const settings = {
    hmr: true,
    sourceMap: true,
    filename: '[name]-[hash:8].[ext]'
}

module.exports = merge(common.build(settings), {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: common.outputPath,
        hot: settings.hmr,
        https: true,
        // Allow access from melvoridle.com
        disableHostCheck: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
        }
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
});