let toolPath;

if (process.env.RELOCATOR_TOOL_PATH) {
  toolPath = process.env.RELOCATOR_TOOL_PATH;
} else {
  toolPath = require.resolve("./tool.js");
}

const conditionalToolPath = isHarmony
  ? require.resolve("./tool.js")
  : require.resolve("./other-tool.js");

module.exports = {
  name: "demo",
  toolPath,
  conditionalToolPath,
};
