const path = require('path');
const webpack = require('webpack');
const Buffer = require('buffer/').Buffer;

module.exports = {
    context: path.resolve(__dirname, ''),
    devtool: 'inline-source-map',
    entry: './src/typescript/wallet.ts',
    mode: 'development',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    output: {
        filename: 'walletconnect.js',
        path: path.resolve(__dirname, './src/www/js/')
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
        fallback: {
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            buffer: require.resolve("buffer/"),
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
    ],
    experiments: {
        topLevelAwait: true,
    }
};