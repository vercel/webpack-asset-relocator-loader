const path = require("path");
const webpack = require("webpack");
const MemoryFS = require("memory-fs");

const relocateLoader = require("../");

test("preserves shorthand properties for relocated asset bindings", async () => {
  const outputFileSystem = new MemoryFS();
  const compiler = webpack({
    entry: path.resolve(__dirname, "fixtures/shorthand-property/input.js"),
    mode: "production",
    target: "node14",
    optimization: { minimize: false, nodeEnv: false },
    output: {
      path: "/",
      filename: "index.js",
      libraryTarget: "commonjs2",
    },
    module: {
      rules: [{
        test: /\.(js|node)$/,
        parser: { amd: false },
        use: [{
          loader: path.resolve(__dirname, "../"),
          options: {
            emitDirnameAll: true,
            emitFilterAssetBaseAll: true,
            filterAssetBase: path.resolve(__dirname, "fixtures"),
            production: true,
          },
        }],
      }],
    },
    plugins: [{
      apply(compiler) {
        compiler.hooks.compilation.tap("relocate-loader", compilation => {
          relocateLoader.initAssetCache(compilation);
        });
      },
    }],
  });
  compiler.outputFileSystem = outputFileSystem;

  const stats = await new Promise((resolve, reject) => {
    compiler.run((err, result) => err ? reject(err) : resolve(result));
  });
  if (stats.hasErrors()) {
    throw new Error(stats.toString({ all: false, errors: true, errorDetails: true }));
  }

  const code = outputFileSystem.readFileSync("/index.js", "utf8");
  const bundledModule = { exports: {} };
  new Function("module", "exports", "require", "__dirname", "isHarmony", code)(
    bundledModule,
    bundledModule.exports,
    require,
    "",
    true,
  );

  expect(bundledModule.exports.name).toBe("demo");
  expect(bundledModule.exports.toolPath).toBe("/tool.js");
  expect(bundledModule.exports.conditionalToolPath).toBe("/tool.js");
  expect(outputFileSystem.existsSync("/tool.js")).toBe(true);
  expect(outputFileSystem.existsSync("/other-tool.js")).toBe(true);
});
