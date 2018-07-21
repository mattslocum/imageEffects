var path = require('path');

module.exports = {
    entry: './src/effectsTest.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader',
                exclude: /node_modules/
            },
            {
                test: require.resolve('jquery'),
                use: [{
                    loader: 'expose-loader',
                    options: 'jQuery'
                }]
            }
        ],
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    devServer: {
        contentBase: "./",
        inline: true,
        open: true
    }
};
