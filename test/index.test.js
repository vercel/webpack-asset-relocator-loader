const fs = require("fs");
const webpack = require("webpack");
const MemoryFS = require("memory-fs");

jest.setTimeout(20000);

for (const unitTest of fs.readdirSync(`${__dirname}/unit`)) {
  it(`should generate correct output for ${unitTest}`, async () => {
    // simple error test
    let shouldError = false;
    if (unitTest.endsWith('-err'))
      shouldError = true;
    const testDir = `${__dirname}/unit/${unitTest}`;
    const expected = !shouldError && fs
      .readFileSync(`${testDir}/output${global.coverage ? '-coverage' : ''}.js`)
      .toString()
      .trim()
      // Windows support
      .replace(/\r/g, "");

    // find the name of the input file (e.g input.ts)
    const inputFile = fs.readdirSync(testDir).find(file => file.includes("input"));

    const entry = `${testDir}/${inputFile}`;

    const mfs = new MemoryFS();
    const compiler = webpack({
      entry,
      optimization: { nodeEnv: false, minimize: false },
      mode: "production",
      target: "node",
      output: {
        path: "/",
        filename: "index.js",
        libraryTarget: "commonjs2"
      },
      module: {
        rules: [{
          test: /\.(js|mjs|node)$/,
          parser: { amd: false },
          use: [{
            loader: __dirname + (global.coverage ? "/../src/asset-relocator" : "/../"),
            options: {
              existingAssetNames: ['existing.txt'],
              escapeNonAnalyzableRequires: true,
              wrapperCompatibility: true
            }
          }]
        }],
      }
    });
    compiler.outputFileSystem = mfs;
  
    try {
      var stats = await new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
          if (err) return reject(err);
          resolve(stats);
        });
      });
    }
    catch (err) {
      if (shouldError)
        return;
      throw err;
    }
    if (shouldError) {
      expect(stats.compilation.errors.length).toBeGreaterThan(0);
      return;
    }

    let code;
    try {
      code = mfs.readFileSync("/index.js", "utf8");
    }
    catch (e) {
      throw new Error(stats.toString());
    }

    const actual = code
      .trim()
      // Windows support
      .replace(/\r/g, "");
    try {
      expect(actual).toBe(expected);
    } catch (e) {
      // useful for updating fixtures
      fs.writeFileSync(`${testDir}/actual.js`, actual);
      throw e;
    }

    // very simple asset validation in unit tests
    if (unitTest.startsWith("asset-")) {
      const assets = mfs.readdirSync('/').filter(filename => filename !== '/index.js');
      expect(Object.keys(assets).length).toBeGreaterThan(0);
    }
  });
}

// remove me when node.js makes this the default behavior
process.on("unhandledRejection", e => {
  throw e;
});
