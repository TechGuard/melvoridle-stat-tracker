const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');

const defaultSettings = {
    hmr: false,
    sourceMap: false,
    debugLog: false,
    filename: '[hash].[ext]',
    buildNameSuffix: ''
}

const outputPath = path.resolve(__dirname, 'dist');

function build(settings) {
    settings = merge(defaultSettings, settings);
    return {
        entry: {
            app: './src/index.ts'
        },
        resolve: {
            extensions: [".js", ".jsx", ".ts", ".tsx"]
        },
        output: {
            filename: '[name].bundle.js',
            path: outputPath
        },
        module: {
            rules: [
                {
                    test: /\.(js|ts)x?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader'
                    }
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: 'style-loader'
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: settings.sourceMap,
                                modules: true
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                DEBUG_LOG: JSON.stringify(settings.debugLog),
                __npm_package_name__: JSON.stringify(
                    `${process.env.npm_package_name}-${process.env.npm_package_version}${settings.buildNameSuffix}`
                )
            })
        ]
    }
}

module.exports = {
    outputPath: outputPath,
    build: build,
};