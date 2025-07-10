const path = require('path')

module.exports = {
    target: 'node',
    mode: 'production',
    entry: './src/index.js',
    resolve: {
        extensions: ['.js']
    },
    module: {
        rules: []
    },
    output: {
        path: path.resolve(__dirname, '../openclash/service'),
        filename: 'index.js',
        publicPath: ''
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
}
