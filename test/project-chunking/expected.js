
const fs = require('fs');

expect(stats.compilation.errors.length).toBe(0);

// check relative asset references worked out
expect(fs.readFileSync(__dirname + "/dist/main.js").toString()).toContain(`ab+"asset`);
expect(fs.readFileSync(__dirname + "/dist/chunk.js").toString()).toContain(`ab+"asset`);
expect(fs.readFileSync(__dirname + "/dist/chunks/541.js").toString()).toContain(`ab+"asset`);
expect(fs.readFileSync(__dirname + "/dist/chunks/42.js").toString()).toContain(`ab+"asset`);

expect(fs.readFileSync(__dirname + "/dist/chunks/sharp-chunk.js").toString()).toContain(`ab+"sharp`);
expect(fs.readFileSync(__dirname + "/dist/chunks/sharp32-chunk.js").toString()).toContain(`ab+"build`);
