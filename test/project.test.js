const fs = require("fs");
const { join } = require("path");
const webpack = require("webpack");

for (const project of fs.readdirSync(__dirname).filter(name => name.startsWith("project-"))) {
  const config = require(join(__dirname, project, 'webpack.config.js'));

  it(`should correctly run webpack build ${project}`, async () => {
    const cwd = join(__dirname, project);
    process.chdir(cwd);

    const compiler = webpack(config);

    const stats = await new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) return reject(err);
        resolve(stats);
      });
    });

    ((stats, __dirname) => {
      stats;
      eval(fs.readFileSync(join(__dirname, 'expected.js')).toString());
    })(stats, cwd);
  }, 10000);
}
