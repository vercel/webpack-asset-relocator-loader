module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    main: './main.js',
    chunk: './chunk.js',
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
        sharp: {
          test: /[\\/]node_modules[\\/]sharp[\\/]/,
          name: 'chunks/sharp-chunk',
          chunks: 'all',
        },
        sharp32: {
          test: /[\\/]node_modules[\\/]sharp32[\\/]/,
          name: 'chunks/sharp32-chunk',
          chunks: 'all',
        }
      }
    }
  }
};
