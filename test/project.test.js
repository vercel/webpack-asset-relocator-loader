const fs = require("fs");
const child_process = require("child_process");

for (const project of fs.readdirSync(__dirname).filter(name => name.startsWith("project-"))) {
  it(`should correctly run webpack build ${project}`, async () => {
    const stdout = child_process.execSync(__dirname + "/../node_modules/.bin/webpack -c webpack.config.js", {
      cwd: __dirname + "/project-chunking"
    });

    const output = stdout.toString().split("\n");
    (0,eval)(fs.readFileSync(__dirname + "/project-chunking/expected.js").toString())(output);
  });
}
