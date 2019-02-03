module.exports = {
  target: 'node',
  mode: 'production',
  entry: {
    main: './main.js',
    chunk: './chunk.js'
  },
  output: {
    filename: 'modules/[name].js',
    chunkFilename: 'modules/chunks/[name].js',
    path: __dirname + '/dist'
  },
  externals: ['fs'],
  module: {
    rules: [{
      test: /\.m?js$/,
      parser: { amd: false },
      use: {
        loader: __dirname + '/../../src/asset-relocator.js',
        options: {
          wrapperCompatibility: true,
          escapeNonAnalyzableRequires: true,
        }
      }
    }]
  }
};
