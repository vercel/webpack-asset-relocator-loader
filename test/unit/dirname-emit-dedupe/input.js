const fs = require('fs');
console.log(fs.readFileSync(__dirname + '/dir/asset1.txt'));
console.log(fs.readFileSync(getDirAsset('asset2.txt')));
console.log(fs.readdirSync(__dirname + '/dir'));

function getDirAsset (name) {
    return __dirname + '/dir/' + name;
}
