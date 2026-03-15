const fs = require('node:fs');
const path = require('node:path');
const { resolve } = require('node:path');

console.log(fs.readFileSync(path.join(__dirname, 'assets/asset4.txt')).toString());

console.log(fs.readFileSync(path.resolve(__dirname, 'assets/asset5.txt')).toString());
console.log(fs.readFileSync(resolve(__dirname, 'assets/asset6.txt')).toString());
