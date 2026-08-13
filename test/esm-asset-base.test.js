const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const webpack = require("webpack");

jest.setTimeout(30000);

const relocateLoader = require(__dirname + "/../");
// native separators throughout: `filterAssetBase` is compared to asset paths
// with a plain `startsWith`, so a stray `/` makes it never match on Windows
const testDir = path.join(__dirname, "esm-asset-base");

// ESM bundles derive `__webpack_require__.ab` from `import.meta.url`, whose
// pathname is percent-encoded, so an output directory whose name contains an
// escaped character used to produce an asset base that does not exist on disk.
// Windows CI hits this without trying, since its temp directory is an 8.3 short
// name (`RUNNER~1` -> `RUNNER%7E1`).
const outputDirs = {
  "a plain": "plain",
  "a spaced and tilded": "out ~dir",
  "a non-ascii": "ütf8"
};

function build (outputPath) {
  const compiler = webpack({
    experiments: {
      topLevelAwait: true,
      outputModule: true
    },
    entry: path.join(testDir, "input.js"),
    optimization: { nodeEnv: false, minimize: false },
    mode: "production",
    target: "node14",
    output: {
      module: true,
      path: outputPath,
      filename: "index.mjs",
      libraryTarget: "module"
    },
    module: {
      rules: [{
        test: /\.(js|mjs|node)$/,
        parser: { amd: false },
        use: [{
          loader: __dirname + "/../",
          options: {
            filterAssetBase: testDir
          }
        }]
      }]
    },
    plugins: [{
      apply (compiler) {
        compiler.hooks.compilation.tap("relocate-loader", compilation => relocateLoader.initAssetCache(compilation));
      }
    }]
  });

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err);
      if (stats.hasErrors()) return reject(new Error(stats.toString({ errorDetails: true })));
      resolve(stats);
    });
  });
}

let tmpDir;

beforeAll(() => {
  // realpath so that the macOS `/var` -> `/private/var` symlink stays out of it
  tmpDir = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "relocate-loader-"));
});

afterAll(() => {
  if (tmpDir)
    fs.rmSync(tmpDir, { recursive: true, force: true });
});

for (const [name, dirName] of Object.entries(outputDirs)) {
  it(`should read a relocated asset when built into ${name} output directory`, async () => {
    const outputPath = path.join(tmpDir, dirName);
    await build(outputPath);

    // if the asset were never relocated the run below would pass trivially,
    // without the asset base being exercised at all
    expect(fs.readFileSync(path.join(outputPath, "index.mjs"), "utf8")).toContain("__webpack_require__.ab");
    // the asset sits right next to the bundle, so only a bad asset base can fail below
    expect(fs.existsSync(path.join(outputPath, "asset.txt"))).toBe(true);

    let stdout;
    try {
      stdout = execFileSync(process.execPath, [path.join(outputPath, "index.mjs")], { encoding: "utf8" });
    }
    catch (e) {
      throw new Error(`Running the bundle in ${outputPath} failed:\n${e.stderr || e.message}`);
    }

    expect(stdout.trim()).toBe("relocated");
  });
}
