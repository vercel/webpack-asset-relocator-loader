module.exports = {
  target: 'node',
  optimization: { nodeEnv: false, minimize: false },
  mode: "production",
  entry: {
    main: './input.js',
  },
  output: {
    filename: 'output.js',
  },
  module: {
    rules: [{
      test: /\.m?js$/,
      parser: { amd: false },
      use: {
        loader: __dirname + '/../../src/asset-relocator.js',
        options: {
          relativeToSource: true,
          writeMode: true
        }
      }
    }]
  }
};
