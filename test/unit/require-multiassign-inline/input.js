var m = './a.js';

if (global.something)
  m = './b.js';

module.exports = require(m);
