const fs = require('fs');
console.log(fs.readdirSync(__dirname + '/dir/asset1.txt'));
console.log(fs.readdirSync(getDirAsset('asset2')));

function getDirAsset (name) {
    return __dirname + '/dir/' + name;
}
