const fs = require("fs");
const { join } = require("path");
const { execSync } = require("child_process");

for (const project of fs.readdirSync(__dirname).filter(name => name.startsWith("project-"))) {
  it(`should correctly run webpack build ${project}`, async () => { 
    const webpack = join(__dirname, '..', 'node_modules', '.bin', 'webpack');
    const cwd = join(__dirname, project);
    const command = `${webpack} -c webpack.config.js`;
    const stdout = execSync(command, { cwd });

    const output = stdout.toString().split("\n");
    ((output, __dirname) => {
      output;
      eval(fs.readFileSync(join(__dirname, 'expected.js')).toString());
    })(output, cwd);
  });
}
