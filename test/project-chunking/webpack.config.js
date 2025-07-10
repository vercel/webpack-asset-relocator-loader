const webpack = require('webpack');

const ignoredPackages = {
  'aws-sdk': true,
  'mock-aws-s3': true,
  'nock': true,
};

module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    main: './main.js',
    chunk: './chunk.js',
    bcrypt: './packages/bcrypt.js',
    bcrypt5: './packages/bcrypt5.js',
    sharp: './packages/sharp.js',
    sharp32: './packages/sharp32.js'
  },
  output: {
    clean: true,
    filename: '[name].js',
    chunkFilename: 'chunks/[name].js',
    path: __dirname + '/dist'
  },
  module: {
    rules: [{
      test: /\.(m?js|node)$/,
      parser: { amd: false },
      use: {
        loader: __dirname + '/../../',
        options: {
          outputAssetBase: 'assets'
        }
      }
    }]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        bcrypt: {
          test: /[\\/]node_modules[\\/]/,
          name: 'chunks/bcrypt-chunk',
          chunks: chunk => chunk.name === 'bcrypt',
          enforce: true,
        },
        bcrypt5: {
          test: /[\\/]node_modules[\\/]/,
          name: 'chunks/bcrypt5-chunk',
          chunks: chunk => chunk.name === 'bcrypt5',
        },
        sharp: {
          test: /[\\/]node_modules[\\/]/,
          name: 'chunks/sharp-chunk',
          chunks: chunk => chunk.name === 'sharp',
        },
        sharp32: {
          test: /[\\/]node_modules[\\/]/,
          name: 'chunks/sharp32-chunk',
          chunks: chunk => chunk.name === 'sharp32',
        }
      }
    }
  },
  plugins: [
    new webpack.IgnorePlugin({
      checkResource: (resource) => ignoredPackages[resource]
    })
  ]
};
