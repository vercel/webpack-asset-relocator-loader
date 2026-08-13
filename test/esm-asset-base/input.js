const { readFileSync } = require('fs');
const { resolve } = require('path');

console.log(readFileSync(resolve(__dirname, 'asset.txt'), 'utf8').trim());
