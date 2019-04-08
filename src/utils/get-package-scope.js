const { existsSync } = require('fs');
const { dirname } = require('path');
module.exports = function getPackageScope (path) {
  let parentPath = dirname(path);
  do {
    path = parentPath;
    parentPath = dirname(path);
    if (existsSync(path + '/package.json'))
      return path;
  } while (path !== parentPath);
};