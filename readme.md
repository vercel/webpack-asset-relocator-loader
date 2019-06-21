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
        // For node binary relocations, include ".node" files as well here
        test: /\.(m?js|node)$/,
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
            // build for process.env.NODE_ENV = 'production'
            production: true, // optional, default is undefined
            cwd: process.cwd(), // optional, default
            debugLog: false, // optional, default
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

Assets are detected using static analysis of code, based on very specific triggers designed for common Node.js workflows to provide build support for a very high (but not perfect) level of compatibility with existing Node.js libraries.

* `process.cwd()`, `__filename`, `__dirname`, `path.*()`, `require.resolve` are all statically analyzed when possible.
* File emissions for exact asset paths
* Whole directory asset emissions for exact directory paths
* Wildcard asset emissions for variable path expressions

When an asset is emitted, the pure expression referencing the asset path is replaced with a new expression to the relocated asset and the asset emitted. In the case of wildcard emission, the dynamic parts of the expression are maintained.

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
* `require.resolve` support in the target environment, while also supporting emission in the build environment.
* Dynamic `require` statements are analyzed to exact paths wherever possible, and when not possible to analyze, turned into dynamic requires in the target environment.
