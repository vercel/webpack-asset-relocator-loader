const path = require("path");

module.exports = getUniqueAssetName;
function getUniqueAssetName (assetName, assetPath, assetNames, isDir) {
  const ext = path.extname(assetName);
  let uniqueName = assetName, i = 0;
  while ((uniqueName in assetNames ||
          (isDir && Object.keys(assetNames).some(assetName => assetName.startsWith(uniqueName + path.sep))))
      && assetNames[uniqueName] !== assetPath) {
    uniqueName = assetName.substr(0, assetName.length - ext.length) + ++i + ext;
  }
  assetNames[uniqueName] = assetPath;
  return uniqueName;
};
