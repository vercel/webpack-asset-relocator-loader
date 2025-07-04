const path = require('node:path');

module.exports = {
  entry: './src/asset-relocator.js',
  mode: 'production',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  resolve: {
    byDependency: {
      commonjs: {
        mainFields: ['main'],
        exportsFields: ['exports'],
        importsFields: ['imports'],
        conditionNames: ['require', 'node', 'production'],
      },
    },
  },
  optimization: {
    minimize: false,
  },
  target: 'node',
  externals: ['resolve'],
};
