const path = require("node:path");
const { resolve } = require("node:path");

fs.createReadStream(path.resolve(__dirname, "asset1.txt"));
fs.readFileSync(resolve(__dirname, "asset2.txt"));

fs.createReadStream(path.resolve(__dirname + "/asset1.txt"));
fs.readFileSync(resolve(__dirname + "/asset2.txt"));
