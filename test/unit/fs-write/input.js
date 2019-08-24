const fs = require('fs')
const path = require('path')


fs.writeFileSync('./test.js', 'Test')

fs.writeFileSync('/tmp/test.js', 'Test')

fs.writeFileSync(__dirname + 'test.js', 'Test')

fs.writeFileSync(path.resolve(__dirname, 'test.js'), 'Test')

const _basePath = __dirname
const asset3 = 'asset3.txt';

fs.writeFileSync(_basePath + '/' + asset3, 'Test');