import fs from 'fs';
const { readFileSync } = fs;

console.log(fs.readFileSync(join(__dirname, 'asset.txt'), 'utf8'));
