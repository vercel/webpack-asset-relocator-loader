// analyzable:
require('./dep');

// non-analyzable:
var s = {
  require
};
s.require('escaped');
require(escaped);
