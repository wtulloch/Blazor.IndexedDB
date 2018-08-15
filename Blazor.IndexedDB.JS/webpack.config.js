const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    resolve: {
        extensions: ['.ts', '.js']
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                loader: 'ts-loader'
            }
        ]
    },
    entry: {
        "indexedDb.Blazor": './src/InitialiseIndexDbBlazor.ts'
    },
    output: {
        path: path.join(__dirname, '/dist'),
        filename: '[name].js'
    }
};
