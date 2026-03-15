
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const sumFilePath = path.resolve(__dirname, './dist/assets/sum.js');


assert.equal(fs.existsSync(sumFilePath), true)
assert.equal(require('./dist/main').sumPath, sumFilePath)

console.log('pnp test succeed!')