const path = require('path');

module.exports = function (id, _code) {
  if (id.endsWith('google-gax/build/src/grpc.js') || global._unit) {
    return ({ ast, magicString, emitAssetDirectory }) => {
      // const googleProtoFilesDir = path.normalize(google_proto_files_1.getProtoPath('..'));
      // ->
      // const googleProtoFilesDir = path.resolve(__dirname, '../../../google-proto-files');
      for (const statement of ast.body) {
        if (statement.type === 'VariableDeclaration' &&
            statement.declarations[0].id.type === 'Identifier' &&
            statement.declarations[0].id.name === 'googleProtoFilesDir') {
          magicString.overwrite(statement.declarations[0].init.start, statement.declarations[0].init.end,
              emitAssetDirectory(path.resolve(path.dirname(id), global._unit ? './' : '../../../google-proto-files')));
          return true;
        }
      }
    };
  }
};
