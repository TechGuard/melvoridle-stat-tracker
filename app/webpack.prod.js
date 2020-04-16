const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const settings = {
    buildNameSuffix: `-prod-${new Date().toISOString()}`
}

module.exports = merge(common.build(settings), {
    mode: 'production'
});