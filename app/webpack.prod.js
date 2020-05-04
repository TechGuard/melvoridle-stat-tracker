const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const settings = {
    buildNameSuffix: `-prod-${new Date().toISOString()}`,
    overrideVersion: process.env.OVERRIDE_VERSION,
    gTagTrackingId: 'UA-34174762-4',
}

module.exports = merge(common.build(settings), {
    mode: 'production'
});
