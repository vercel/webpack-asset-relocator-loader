
const fs = require('fs');

expect(output.length).toBe(18);
expect(output[5].trim().substr(0, 9)).toBe("asset.txt");
expect(output[6].trim().substr(0, 10)).toBe("asset1.txt");
expect(output[7].trim().substr(0, 10)).toBe("asset3.txt");

// check relative asset references worked out
expect(fs.readFileSync(__dirname + "/dist/modules/main.js").toString()).toContain(`"/../asset.txt"`);
expect(fs.readFileSync(__dirname + "/dist/modules/chunk.js").toString()).toContain(`"/../asset1.txt"`);
expect(fs.readFileSync(__dirname + "/dist/modules/chunks/2.js").toString()).toContain(`"/../../asset3.txt"`);
