module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    main: './main.js'
  },
  output: {
    path: __dirname + '/dist',
    libraryTarget: 'commonjs'
  },
  module: {
    rules: [{
      test: /\.m?js$/,
      parser: { amd: false },
      use: {
        loader: require.resolve('@vercel/webpack-asset-relocator-loader'),
        options: {
          outputAssetBase: 'assets',
        }
      }
    }]
  }
};
