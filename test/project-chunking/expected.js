
const fs = require('fs');

expect(output.length).toBe(16);

// check relative asset references worked out
expect(fs.readFileSync(__dirname + "/dist/modules/main.js").toString()).toContain(`ab+"asset`);
expect(fs.readFileSync(__dirname + "/dist/modules/chunk.js").toString()).toContain(`ab+"asset`);
expect(fs.readFileSync(__dirname + "/dist/modules/chunks/541.js").toString()).toContain(`ab+"asset`);
