const path = require('path');
const merge = require('webpack-merge');

const defaultSettings = {
    hmr: false,
    sourceMap: false,
    filename: '[hash].[ext]'
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
        externals: {
            "react": "React",
            "react-dom": "ReactDOM"
        }
    }
}

module.exports = {
    outputPath: outputPath,
    build: build,
};