const fs = require("fs");
const child_process = require("child_process");

for (const project of fs.readdirSync(__dirname).filter(name => name.startsWith("project-"))) {
  it(`should correctly run webpack build ${project}`, async () => {
    const stdout = child_process.execSync(__dirname + "/../node_modules/.bin/webpack -c webpack.config.js", {
      cwd: __dirname + "/" + project
    });

    const output = stdout.toString().split("\n");
    ((output, __dirname) => {
      output;
      eval(fs.readFileSync(__dirname + "/expected.js").toString());
    })(output, __dirname + "/" + project);
  });
}
