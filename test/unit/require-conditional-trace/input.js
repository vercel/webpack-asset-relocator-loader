var isNodeSix = process.versions.node >= '6';

module.exports = isNodeSix
    ? require('./input')
    : require('./does-not-exist');
