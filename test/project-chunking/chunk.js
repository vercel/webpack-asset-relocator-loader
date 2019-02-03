const fs = require('fs');
console.log('chunk file');
console.log(fs.readFileSync(__dirname + '/asset2/asset.txt').toString());
