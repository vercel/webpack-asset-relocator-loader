# Asset Relocator Loader for Webpack

[![Build Status](https://circleci.com/gh/zeit/webpack-asset-relocator-loader.svg?&style=shield)](https://circleci.com/gh/zeit/workflows/webpack-asset-relocator-loader)
[![codecov](https://codecov.io/gh/zeit/webpack-asset-relocator-loader/branch/master/graph/badge.svg)](https://codecov.io/gh/zeit/webpack-asset-relocator-loader)

Asset relocation loader used in ncc for performing Node.js builds while emitting and relocating any asset references.

## Usage

### Installation
```bash
npm i -g @zeit/webpack-asset-relocator-loader
```

### Usage

Add this loader as a Webpack plugin for any JS files.

Any `.node` files included will also support binary relocation.

```js
{
  target: "node",
  output: {
    libraryTarget: "commonjs2"
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        // it is recommended for Node builds to turn off AMD support
        parser: { amd: false },
        use: {
          loader: '@zeit/webpack-asset-relocator-loader',
          options: {
            // optional, base folder for asset emission (eg assets/name.ext)
            outputAssetBase: 'assets',
            // optional, a list of asset names already emitted or
            // defined that should not be emitted
            existingAssetNames: []
            wrapperCompatibility: false, // optional, default
            escapeNonAnalyzableRequires: false, // optional, default

          }
        }
      }
    ]
  }
}
```

Assets will be emitted using `emitAsset`, with their references updated in the code by the loader to the new output location.

## How it Works

### Asset Relocation

Assets are detected using static analysis of code, based on very specific triggers designed the the most common Node.js workflows to provide build support for a very high (but not perfect) level of compatibility with existing Node.js libraries.

Currently only `__filename` and `__dirname` references provide an initial trigger to an asset load.

Static analysis determines these expressions, and if they can be evaluated to an exact asset location, the expression is replaced with a new expression to the relocated asset and the asset emitted. In addition. A fairly comprehensive variety of expression cases are supported here, which is improving over time, but there will still be edge cases the analysis cannot detect.

Support for `require.resolve`, `import.meta.url` or even path-like environment variables could also be added as triggers in future.

### Binary Relocation

Node binary loading conventions cover the following triggers for binary relocations:
* `require('bindings')(...)`
* `nbind.init(..)`
* `node-pre-gyp` include patterns

Any shared libraries loaded by these binaries will also be emitted as well.

### Node.js Compatibility Features

In addition to asset relocation, this loader also provides a couple
of compatibility features for Webpack Node.js builds as part of its analysis.

These include:

* `require.main === module` checks are retained for the entry point being built.
* `options.wrapperCompatibility`: Automatically handles common AMD / Browserify wrappers to ensure they are properly built by Webpack. See the `utils/wrappers.js` file for the exact transformations currently provided.
* `options.escapeNonAnalyzableRequires`: Determines when a `require` statement is definitely not analyzable by Webpack, and replaces it with the outer `__non_webpack_require__`. This is useful for things like plugin systems that take a `pluginModule` string and then try to require it, but still won't correcly support contextual requires for local modules.
