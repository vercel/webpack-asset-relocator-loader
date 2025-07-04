module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    main: './main.js',
    chunk: './chunk.js'
  },
  output: {
    clean: true,
    filename: 'modules/[name].js',
    chunkFilename: 'modules/chunks/[name].js',
    path: __dirname + '/dist'
  },
  externals: ['fs'],
  module: {
    rules: [{
      test: /\.(m?js|node)$/,
      parser: { amd: false },
      use: {
        loader: __dirname + '/../../src/asset-relocator.js'
      }
    }]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        sharp: {
          test: /[\\/]node_modules[\\/]sharp[\\/]/,
          name: 'sharp-chunk',
        },
        sharp32: {
          test: /[\\/]node_modules[\\/]sharp32[\\/]/,
          name: 'sharp32-chunk',
        }
      }
    }
  }
};
