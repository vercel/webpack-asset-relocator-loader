const fs = require('fs');
console.log('Main file');
console.log(fs.readFileSync(__dirname + '/asset1/asset.txt').toString());

require.ensure('./chunk2', function () {});
require.ensure('./chunk3', function () {});
require.ensure('./packages/sharp', function () {}, 'sharp');
require.ensure('./packages/sharp32', function () {}, 'sharp32');
