var resolveFrom = require('resolve-from');
var x = resolveFrom(__dirname, './input.js');
require(x);
