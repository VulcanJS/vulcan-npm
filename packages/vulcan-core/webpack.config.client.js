const merge = require('webpack-merge')
const path = require('path')
const baseConfig = require('../../webpack/webpack.config.base.client.prod')
//const merge = require('webpack-merge')
module.exports = merge(baseConfig, {
    output: {
        path: path.resolve(__dirname, 'dist')
    }
})
