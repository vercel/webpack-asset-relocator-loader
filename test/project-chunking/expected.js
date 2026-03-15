
const fs = require('fs');

expect(stats.compilation.errors.length).toBe(0);
expect(stats.compilation.chunks.length).toBe(12);

// check relative asset references worked out
expect(fs.readFileSync(__dirname + "/dist/main.js").toString()).toContain(`ab+"asset`);
expect(fs.readFileSync(__dirname + "/dist/chunk.js").toString()).toContain(`ab+"asset`);
expect(fs.readFileSync(__dirname + "/dist/chunks/541.js").toString()).toContain(`ab+"asset`);
expect(fs.readFileSync(__dirname + "/dist/chunks/42.js").toString()).toContain(`ab+"asset`);

expect(fs.readFileSync(__dirname + "/dist/chunks/bcrypt-chunk.js").toString()).toContain(`ab+"pre`);
expect(fs.readFileSync(__dirname + "/dist/chunks/bcrypt5-chunk.js").toString()).toContain(`ab+"lib`);
expect(fs.readFileSync(__dirname + "/dist/chunks/sharp-chunk.js").toString()).toContain(`ab+"sharp`);
expect(fs.readFileSync(__dirname + "/dist/chunks/sharp32-chunk.js").toString()).toContain(`ab+"build`);

const assets = Object.keys(stats.compilation.assets);
expect(assets.some(asset => /bcrypt(?:\..*)?\.node/.exec(asset))).toBeTruthy(); // bcrypt
expect(assets.some(asset => /bcrypt_lib\.node/.exec(asset))).toBeTruthy(); // bcrypt5
expect(assets.some(asset => /lib\/sharp-.+\.node/.exec(asset))).toBeTruthy(); // sharp
expect(assets.some(asset => /Release\/sharp-.+\.node/.exec(asset))).toBeTruthy(); // sharp32
