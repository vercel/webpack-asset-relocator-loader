const path = require('path');
const { readFileSync, readFile, stat, lstat, readlink, statSync } = require('graceful-fs');
const { walk } = require('estree-walker');
const MagicString = require('magic-string');
const { attachScopes } = require('rollup-pluginutils');
const evaluate = require('./utils/static-eval');
let acorn = require('acorn');
const bindings = require('bindings');
const getUniqueAssetName = require('./utils/dedupe-names');
const sharedlibEmit = require('./utils/sharedlib-emit');
const glob = require('glob');
const getPackageBase = require('./utils/get-package-base');
const getPackageScope = require('./utils/get-package-scope');
const { pregyp, nbind } = require('./utils/binary-locators');
const handleSpecialCases = require('./utils/special-cases');
const { getOptions } = require("loader-utils");
const resolve = require('resolve');
const stage3 = require('acorn-stage3');
const mergeSourceMaps = require('./utils/merge-source-maps');
acorn = acorn.Parser.extend(stage3);
const os = require('os');

const extensions = ['.js', '.json', '.node'];
const { UNKNOWN, FUNCTION, WILDCARD, wildcardRegEx } = evaluate;

function isIdentifierRead(node, parent) {
  switch (parent.type) {
    case 'ObjectPattern':
    case 'ArrayPattern':
      // Note: default values not currently supported
      return false;
    // disregard `bar` in `bar = thing()`
    case 'AssignmentExpression':
      return parent.right === node;
    case 'MemberExpression':
      return parent.computed || node === parent.object;
    // disregard the `bar` in `{ bar: foo }`
    case 'Property':
      return node === parent.value;
    // disregard the `bar` in `class Foo { bar () {...} }`
    case 'MethodDefinition':
      return false;
    // disregard the `bar` in var bar = asdf
    case 'VariableDeclarator':
      return parent.id !== node;
    // disregard the `bar` in `export { foo as bar }`
    case 'ExportSpecifier':
      return false;
    // disregard the `bar` in `function (bar) {}`
    case 'FunctionExpression':
    case 'FunctionDeclaration':
    case 'ArrowFunctionExpression':
      return false;
    default:
      return true;
  }
}

const stateMap = new Map();
let lastState;

function getAssetState (options, compilation) {
  let state = stateMap.get(compilation);
  if (!state) {
    stateMap.set(compilation, state = {
      entryId: getEntryId(compilation),
      assets: Object.create(null),
      assetNames: Object.create(null),
      assetPermissions: Object.create(null),
      hadOptions: false
    });
  }
  if (!state.hadOptions) {
    state.hadOptions = true;
    if (options && options.existingAssetNames) {
      options.existingAssetNames.forEach(assetName => {
        state.assetNames[assetName] = true;
      });
    }
  }
  return lastState = state;
}

function getEntryId (compilation) {
  if (compilation.options && typeof compilation.options.entry === 'string') {
    return resolve.sync(compilation.options.entry, { extensions });
  }
  if (compilation.entries && compilation.entries.length) {
    try {
      return resolve.sync(compilation.entries[0].name || compilation.entries[0].resource, { basedir: path.dirname(compilation.entries[0].context), extensions });
    }
    catch (e) {
      return;
    }
  }
  const entryMap = compilation.entryDependencies;
  if (entryMap)
    for (entry of entryMap.values()) {
      if (entry.length) {
        try {
          return resolve.sync(entry[0].request, { basedir: path.dirname(entry[0].context), extensions });
        }
        catch (e) {
          return;
        }
      }
    }
}

function assetBase (options) {
  const outputAssetBase = options && options.outputAssetBase;
  if (!outputAssetBase)
    return '';
  if (outputAssetBase.endsWith('/') || outputAssetBase.endsWith('\\'))
    return outputAssetBase;
  return outputAssetBase + '/';
}

function relAssetPath (context, options) {
  const isChunk = context._module.reasons && context._module.reasons.every(reason => reason.module);
  const filename = isChunk && context._compilation.outputOptions.chunkFilename || context._compilation.outputOptions.filename;
  const backtrackDepth = filename.split(/[\\/]/).length - 1;
  return '../'.repeat(backtrackDepth) + assetBase(options);
}

const staticProcess = {
  cwd: () => {
    return cwd;
  },
  env: {
    NODE_ENV: UNKNOWN,
    [UNKNOWN]: true
  },
  [UNKNOWN]: true
};

// unique symbol value to identify express instance in static analysis
const EXPRESS_SET = Symbol();
const EXPRESS_ENGINE = Symbol();
const NBIND_INIT = Symbol();
const FS_FN = Symbol();
const RESOLVE_FROM = Symbol();
const BINDINGS = Symbol();
const fsSymbols = {
  access: FS_FN,
  accessSync: FS_FN,
  createReadStream: FS_FN,
  exists: FS_FN,
  existsSync: FS_FN,
  fstat: FS_FN,
  fstatSync: FS_FN,
  lstat: FS_FN,
  lstatSync: FS_FN,
  open: FS_FN,
  readFile: FS_FN,
  readFileSync: FS_FN,
  stat: FS_FN,
  statSync: FS_FN
};
const staticModules = Object.assign(Object.create(null), {
  bindings: {
    default: BINDINGS
  },
  express: {
    default: function () {
      return {
        [UNKNOWN]: true,
        set: EXPRESS_SET,
        engine: EXPRESS_ENGINE
      };
    }
  },
  fs: {
    default: fsSymbols,
    ...fsSymbols
  },
  process: {
    default: staticProcess,
    ...staticProcess
  },
  // populated below
  path: {
    default: {}
  },
  os: {
    default: os,
    ...os
  },
  'node-pre-gyp': pregyp,
  'node-pre-gyp/lib/pre-binding': pregyp,
  'node-pre-gyp/lib/pre-binding.js': pregyp,
  'nbind': {
    init: NBIND_INIT,
    default: {
      init: NBIND_INIT
    }
  },
  'resolve-from': {
    default: RESOLVE_FROM
  }
});
const globalBindings = {
  MONGOOSE_DRIVER_PATH: undefined
};
globalBindings.global = globalBindings.GLOBAL = globalBindings.globalThis = globalBindings;

// call expression triggers
const TRIGGER = Symbol();
pregyp.find[TRIGGER] = true;
const staticPath = staticModules.path;
Object.keys(path).forEach(name => {
  const pathFn = path[name];
  if (typeof pathFn === 'function') {
    const fn = function () {
      return pathFn.apply(this, arguments);
    };
    fn[TRIGGER] = true;
    staticPath[name] = staticPath.default[name] = fn;
  }
  else {
    staticPath[name] = staticPath.default[name] = pathFn;
  }
});

// overload path.resolve to support custom cwd
staticPath.resolve = staticPath.default.resolve = function (...args) {
  return path.resolve.apply(this, [cwd, ...args]);
};
staticPath.resolve[TRIGGER] = true;

const absoluteRegEx = /^\/[^\/]+|^[a-z]:[\\/][^\\/]+/i;

const excludeAssetExtensions = new Set(['.h', '.cmake', '.c', '.cpp']);
const excludeAssetFiles = new Set(['CHANGELOG.md', 'README.md', 'readme.md', 'changelog.md']);
let cwd;

function backtrack (self, parent) {
  if (!parent || parent.type !== 'ArrayExpression')
    return self.skip();
}

module.exports = async function (content, map) {
  if (this.cacheable)
    this.cacheable();
  this.async();
  const id = this.resourcePath;
  const dir = path.dirname(id);
  if (id.endsWith('.node')) {
    const options = getOptions(this);
    const assetState = getAssetState(options, this._compilation);
    const pkgBase = getPackageBase(this.resourcePath) || dir;
    await sharedlibEmit(pkgBase, assetState, assetBase(options), this.emitFile);

    const name = getUniqueAssetName(id.substr(pkgBase.length + 1), id, assetState.assetNames);
    
    const permissions = await new Promise((resolve, reject) => 
      stat(id, (err, stats) => err ? reject(err) : resolve(stats.mode))
    );
    assetState.assetPermissions[name] = permissions;
    this.emitFile(assetBase(options) + name, content);

    this.callback(null, 'module.exports = __non_webpack_require__("./' + relAssetPath(this, options) + JSON.stringify(name).slice(1, -1) + '")');
    return;
  }

  if (id.endsWith('.json'))
    return this.callback(null, code, map);

  let code = content.toString();

  const options = getOptions(this);
  if (typeof options.production === 'boolean' && staticProcess.env.NODE_ENV === UNKNOWN) {
    staticProcess.env.NODE_ENV = options.production ? 'production' : 'dev';
  }
  if (!cwd) {
    if (typeof options.cwd === 'string')
      cwd = path.resolve(options.cwd);
    else
      cwd = process.cwd();
  }
  const assetState = getAssetState(options, this._compilation);
  const entryId = assetState.entryId;

  // calculate the base-level package folder to load bindings from
  const pkgBase = getPackageBase(id);

  const emitAsset = (assetPath) => {
    // JS assets to support require(assetPath) and not fs-based handling
    // NB package.json is ambiguous here...
    let outName = path.basename(assetPath);

    if (assetPath.endsWith('.node')) {
      // retain directory depth structure for binaries for rpath to work out
      if (pkgBase)
        outName = assetPath.substr(pkgBase.length).replace(/\\/g, '/');
      // If the asset is a ".node" binary, then glob for possible shared
      // libraries that should also be included
      const nextPromise = sharedlibEmit(pkgBase, assetState, assetBase(options), this.emitFile);
      assetEmissionPromises = assetEmissionPromises.then(() => {
        return nextPromise;
      });
    }

    let name;
    if (!(name = assetState.assets[assetPath])) {
      name = assetState.assets[assetPath] = getUniqueAssetName(outName, assetPath, assetState.assetNames);
      if (options.debugLog)
        console.log('Emitting ' + assetPath + ' for static use in module ' + id);
    }

    assetEmissionPromises = assetEmissionPromises.then(async () => {
      const [source, stats] = await Promise.all([
        new Promise((resolve, reject) =>
          readFile(assetPath, (err, source) => err ? reject(err) : resolve(source))
        ),
        await new Promise((resolve, reject) => 
          lstat(assetPath, (err, stats) => err ? reject(err) : resolve(stats))
        )
      ]);
      if (stats.isSymbolicLink()) {
        const symlink = await new Promise((resolve, reject) => {
          readlink(assetPath, (err, path) => err ? reject(err) : resolve(path));
        });
        const baseDir = path.dirname(assetPath);
        assetState.assetSymlinks[assetBase(options) + name] = path.relative(baseDir, path.resolve(baseDir, symlink));
      }
      else {
        assetState.assetPermissions[assetBase(options) + name] = stats.mode;
        this.emitFile(assetBase(options) + name, source);
      }
    });
    return "__dirname + '/" + relAssetPath(this, options) + JSON.stringify(name).slice(1, -1) + "'";
  };
  const emitAssetDirectory = (wildcardPath, wildcards) => {
    const wildcardIndex = wildcardPath.indexOf(WILDCARD);
    const dirIndex = wildcardIndex === -1 ? wildcardPath.length : wildcardPath.lastIndexOf(path.sep, wildcardPath.substr(0, wildcardIndex));
    const assetDirPath = wildcardPath.substr(0, dirIndex);
    const wildcardPattern = wildcardPath.substr(dirIndex).replace(wildcardRegEx, '**/*') || '/**/*';
    if (options.debugLog)
      console.log('Emitting directory ' + assetDirPath + wildcardPattern + ' for static use in module ' + id);
    const dirName = path.basename(assetDirPath);
    const name = assetState.assets[assetDirPath] || (assetState.assets[assetDirPath] = getUniqueAssetName(dirName, assetDirPath, assetState.assetNames));
    assetState.assets[assetDirPath] = name;

    // this used to be async but had to switch to support no emission for no detection
    const files = glob.sync(assetDirPath + wildcardPattern, { mark: true, ignore: 'node_modules/**/*' }).filter(name => 
      !excludeAssetExtensions.has(path.extname(name)) &&
      !excludeAssetFiles.has(path.basename(name)) &&
      !name.endsWith(path.sep)
    );

    if (!files.length)
      return;

    assetEmissionPromises = assetEmissionPromises.then(async () => {
      await Promise.all(files.map(async file => {
        const [source, stats] = await Promise.all([
          new Promise((resolve, reject) =>
            readFile(file, (err, source) => err ? reject(err) : resolve(source))
          ),
          await new Promise((resolve, reject) => 
            lstat(file, (err, stats) => err ? reject(err) : resolve(stats))
          )
        ]);
        if (stats.isSymbolicLink()) {
          const symlink = await new Promise((resolve, reject) => {
            readlink(file, (err, path) => err ? reject(err) : resolve(path));
          });
          const baseDir = path.dirname(file);
          assetState.assetSymlinks[assetBase(options) + name + file.substr(assetDirPath.length)] = path.relative(baseDir, path.resolve(baseDir, symlink));
        }
        else {
          assetState.assetPermissions[assetBase(options) + name + file.substr(assetDirPath.length)] = stats.mode;
          this.emitFile(assetBase(options) + name + file.substr(assetDirPath.length), source);
        }
      }));
    });

    let assetExpressions = '';
    let firstPrefix = '';
    if (wildcards) {
      let curPattern = wildcardPattern;
      let first = true;
      for (const wildcard of wildcards) {
        const nextWildcardIndex = curPattern.indexOf('**/*');
        const wildcardPrefix = curPattern.substr(0, nextWildcardIndex);
        curPattern = curPattern.substr(nextWildcardIndex + 4);
        if (first) {
          firstPrefix = wildcardPrefix;
          first = false;
        }
        else {
          assetExpressions += " + \'" + JSON.stringify(wildcardPrefix).slice(1, -1) + "'";
        }
        if (wildcard.type === 'SpreadElement')
          assetExpressions += " + " + code.substring(wildcard.argument.start, wildcard.argument.end) + ".join('/')";
        else
          assetExpressions += " + " + code.substring(wildcard.start, wildcard.end);
      }
      if (curPattern.length) {
        assetExpressions += " + \'" + JSON.stringify(curPattern).slice(1, -1) + "'";
      }
    }
    return "__dirname + '/" + relAssetPath(this, options) + JSON.stringify(name + firstPrefix).slice(1, -1) + "'" + assetExpressions;
  };

  let assetEmissionPromises = Promise.resolve();

  const magicString = new MagicString(code);

  let ast, isESM;
  try {
    ast = acorn.parse(code, { allowReturnOutsideFunction: true });
    isESM = false;
  }
  catch (e) {}
  if (!ast) {
    try {
      ast = acorn.parse(code, { sourceType: 'module' });
      isESM = true;
    }
    catch (e) {
      this.callback(e);
      return;
    }
  }

  let scope = attachScopes(ast, 'scope');

  let transformed = false;

  const knownBindings = Object.assign(Object.create(null), {
    __dirname: {
      shadowDepth: 0,
      value: path.resolve(id, '..')
    },
    __filename: {
      shadowDepth: 0,
      value: id
    },
    process: {
      shadowDepth: 0,
      value: staticProcess
    }
  });

  if (!isESM) {
    knownBindings.require = {
      shadowDepth: 0,
      value: {
        [FUNCTION] (specifier) {
          const m = staticModules[specifier];
          return m.default;
        },
        resolve (specifier) {
          return resolve.sync(specifier, { basedir: dir, extensions });
        }
      }
    };
    knownBindings.require.value.resolve[TRIGGER] = true;
  }

  function setKnownBinding (name, value) {
    // require is somewhat special in that we shadow it but don't
    // statically analyze it ("known unknown" of sorts)
    if (name === 'require') return;
    knownBindings[name] = {
      shadowDepth: 0,
      value: value
    };
  }
  function getKnownBinding (name) {
    const binding = knownBindings[name];
    if (binding) {
      if (binding.shadowDepth === 0) {
        return binding.value;
      }
    }
  }

  if (isESM) {
    for (const decl of ast.body) {
      if (decl.type === 'ImportDeclaration') {
        const source = decl.source.value;
        const staticModule = staticModules[source];
        if (staticModule) {
          for (const impt of decl.specifiers) {
            if (impt.type === 'ImportNamespaceSpecifier')
              setKnownBinding(impt.local.name, staticModule);
            else if (impt.type === 'ImportDefaultSpecifier' && 'default' in staticModule)
              setKnownBinding(impt.local.name, staticModule.default);
            else if (impt.type === 'ImportSpecifier' && impt.imported.name in staticModule)
              setKnownBinding(impt.local.name, staticModule[impt.imported.name]);
          }
        }
      }
    }
  }

  function computePureStaticValue (expr, computeBranches = true) {
    const vars = Object.create(null);
    Object.keys(knownBindings).forEach(name => {
      vars[name] = getKnownBinding(name);
    });
    Object.keys(globalBindings).forEach(name => {
      vars[name] = globalBindings[name];
    });
    // evaluate returns undefined for non-statically-analyzable
    const result = evaluate(expr, vars, computeBranches);
    return result;
  }

  // statically determinable leaves are tracked, and inlined when the
  // greatest parent statically known leaf computation corresponds to an asset path
  let staticChildNode, staticChildValue;

  // Express engine opt-out
  let definedExpressEngines = false;

  // detect require('asdf');
  function isStaticRequire (node) {
    return node &&
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'require' &&
        knownBindings.require.shadowDepth === 0 &&
        node.arguments.length === 1 &&
        node.arguments[0].type === 'Literal';
  }

  ({ ast = ast, scope = scope, transformed = transformed } =
        handleSpecialCases({ id, ast, scope, pkgBase, magicString, options, emitAsset, emitAssetDirectory }) || {});

  walk(ast, {
    enter (node, parent) {
      if (node.scope) {
        scope = node.scope;
        for (const id in node.scope.declarations) {
          if (id in knownBindings)
            knownBindings[id].shadowDepth++;
        }
      }

      if (staticChildNode)
        return backtrack(this, parent);

      if (node.type === 'Identifier') {
        if (isIdentifierRead(node, parent)) {
          let binding;
          // detect asset leaf expression triggers (if not already)
          // __dirname,  __filename
          // Could add import.meta.url, even path-like environment variables
          if (typeof (binding = getKnownBinding(node.name)) === 'string' && binding.match(absoluteRegEx) ||
              binding && (typeof binding === 'function' || typeof binding === 'object') && binding[TRIGGER]) {
            staticChildValue = { value: typeof binding === 'string' ? binding : undefined };
            staticChildNode = node;
            return this.skip();
          }
          // free require -> __non_webpack_require__
          else if (!isESM && node.name === 'require' && knownBindings.require.shadowDepth === 0 && parent.type !== 'UnaryExpression') {
            magicString.overwrite(node.start, node.end, '__non_webpack_require__');
            transformed = true;
            return this.skip();
          }
          // __non_webpack_require__ -> eval('require')
          else if (!isESM && node.name === '__non_webpack_require__' && parent.type !== 'UnaryExpression') {
            magicString.overwrite(node.start, node.end, 'eval("require")');
            transformed = true;
            return this.skip();
          }
        }
      }
      // require
      else if (!isESM &&
               node.type === 'CallExpression' &&
               node.callee.type === 'Identifier' &&
               node.callee.name === 'require' &&
               knownBindings.require.shadowDepth === 0 &&
               node.arguments.length) {
        const expression = node.arguments[0];
        const { result: computed, sawIdentifier } = computePureStaticValue(expression, true);
        // no clue what the require is for, Webpack won't know either
        // -> turn it into a runtime dynamic require
        if (!computed) {
          // require(a || 'asdf') -> require('asdf') special case
          if (expression.type === 'LogicalExpression' && expression.operator === '||' &&
              expression.left.type === 'Identifier') {
            transformed = true;
            magicString.overwrite(expression.start, expression.end, code.substring(expression.right.start, expression.right.end));
            return this.skip();
          }
          transformed = true;
          magicString.overwrite(node.callee.start, node.callee.end, '__non_webpack_require__');
          return this.skip();
        }
        // we found the exact value for the require, and it used a binding from our analysis
        // -> inline the computed value for Webpack to use
        else if (typeof computed.value === 'string' && sawIdentifier) {
          transformed = true;
          magicString.overwrite(expression.start, expression.end, JSON.stringify(computed.value));
          return this.skip();
        }
        // branched require, and it used a binding from our analysis
        // -> inline the computed values for Webpack
        else if (computed && typeof computed.then === 'string' && typeof computed.else === 'string' && sawIdentifier) {
          const conditionValue = computePureStaticValue(computed.test, true).result;
          // inline the known branch if possible
          if (conditionValue && 'value' in conditionValue) {
            if (conditionValue) {
              transformed = true;
              magicString.overwrite(expression.start, expression.end, JSON.stringify(computed.then));
              return this.skip();
            }
            else {
              transformed = true;
              magicString.overwrite(expression.start, expression.end, JSON.stringify(computed.else));
              return this.skip();
            }
          }
          else {
            const test = code.substring(computed.test.start, computed.test.end);
            transformed = true;
            magicString.overwrite(expression.start, expression.end, `${test} ? ${JSON.stringify(computed.then)} : ${JSON.stringify(computed.else)}`);
            return this.skip();
          }
        }
        // Special cases
        else if (parent.type === 'CallExpression' && parent.callee === node) {
          // require('pkginfo')(module, ...string[])
          if (computed.value === 'pkginfo' &&
                  parent.arguments.length &&
                  parent.arguments[0].type === 'Identifier' &&
                  parent.arguments[0].name === 'module') {
            let filterValues = new Set();
            for (let i = 1; i < parent.arguments.length; i++) {
              if (parent.arguments[i].type === 'Literal')
                filterValues.add(parent.arguments[i].value);
            }
            const scope = getPackageScope(id);
            if (scope) {
              try {
                var pkg = JSON.parse(readFileSync(scope + '/package.json'));
                if (filterValues.size) {
                  for (var p in pkg) {
                    if (!filterValues.has(p))
                      delete pkg[p];
                  }
                }
              }
              catch (e) {}
              if (pkg) {
                transformed = true;
                magicString.overwrite(parent.start, parent.end, `Object.assign(module.exports, ${JSON.stringify(pkg)})`);
                return this.skip();
              }
            }
          }
          // leave it to webpack
          return this.skip();
        }
        else {
          // leave it to webpack
          return this.skip();
        }
      }
      // require.main handling
      else if (!isESM && node.type === 'MemberExpression' &&
               node.object.type === 'Identifier' &&
               node.object.name === 'require' &&
               knownBindings.require.shadowDepth === 0 &&
               node.property.type === 'Identifier' &&
               !node.computed) {
        if (node.property.name === 'main' &&
            parent && parent.type === 'BinaryExpression' &&
            (parent.operator === '==' || parent.operator === '===')) {
          let other;
          other = parent.right === node ? parent.left : parent.right;
          if (other.type === 'Identifier' && other.name === 'module') {
            // inline the require.main check to be the target require.main check if this is the entry,
            // and false otherwise
            if (id === entryId) {
              // require.main === module -> __non_webpack_require__.main == __non_webpack_require__.cache[eval('__filename')]
              // can be simplified if we get a way to get outer "module" in Webpack
              magicString.overwrite(other.start, other.end, "__non_webpack_require__.cache[eval('__filename')]");
            }
            else {
              magicString.overwrite(parent.start, parent.end, "false");
              transformed = true;
              return this.skip();
            }
          }
        }
        if (node.property.name === 'ensure') {
          // leave require.ensure to webpack
          return this.skip();
        }
      }
      // Call expression cases and asset triggers
      // - fs triggers: fs.readFile(...)
      // - require.resolve()
      // - bindings()(...)
      // - nodegyp()
      // - etc.
      else if (node.type === 'CallExpression') {
        const calleeValue = computePureStaticValue(node.callee, false).result;
        // if we have a direct pure static function,
        // and that function has a [TRIGGER] symbol -> trigger asset emission from it
        if (calleeValue && typeof calleeValue.value === 'function' && calleeValue.value[TRIGGER]) {
          staticChildValue = computePureStaticValue(node, true).result;
          // if it computes, then we start backtrackingelse 
          if (staticChildValue) {
            staticChildNode = node;
            return backtrack(this, parent);
          }
        }
        // handle well-known function symbol cases
        else if (calleeValue && typeof calleeValue.value === 'symbol') {
          switch (calleeValue.value) {
            // require('bindings')(...)
            case BINDINGS:
              if (node.arguments.length) {
                const arg = computePureStaticValue(node.arguments[0], false).result;
                if (arg.value) {
                  let staticBindingsInstance = false;
                  let opts;
                  if (typeof arg.value === 'object')
                    opts = arg.value;
                  else if (typeof arg.value === 'string')
                    opts = { bindings: arg.value };
                  if (!opts.path) {
                    staticBindingsInstance = true;
                    opts.path = true;
                  }
                  opts.module_root = pkgBase;
                  let resolved;
                  try {
                    resolved = bindings(opts);
                  }
                  catch (e) {}
                  if (resolved) {
                    staticChildValue = { value: resolved };
                    staticChildNode = node;
                    emitStaticChildAsset(staticBindingsInstance);
                    return backtrack(this, parent);
                  }
                }
              }
            break;
            // resolveFrom(__dirname, ...) -> require.resolve(...)
            case RESOLVE_FROM:
              if (node.arguments.length === 2 && node.arguments[0].type === 'Identifier' &&
                  node.arguments[0].name === '__dirname' && knownBindings.__dirname.shadowDepth === 0) {
                transformed = true;
                magicString.overwrite(node.start, node.arguments[0].end + 1, 'require.resolve(');
                return this.skip();
              }
            break;
            // nbind.init(...) -> require('./resolved.node')
            case NBIND_INIT:
              if (node.arguments.length) {
                const arg = computePureStaticValue(node.arguments[0], false).result;
                if (arg.value) {
                  const bindingInfo = nbind(arg.value);
                  if (bindingInfo) {
                    bindingInfo.path = path.relative(dir, bindingInfo.path);
                    transformed = true;
                    const bindingPath = JSON.stringify(bindingInfo.path.replace(/\\/g, '/'));
                    magicString.overwrite(node.start, node.end, `({ bind: require(${bindingPath}).NBind.bind_value, lib: require(${bindingPath}) })`);
                    return this.skip();
                  }
                }
              }
            break;
            // Express templates:
            // app.set("view engine", [name]) -> app.engine([name], require([name]).__express).set("view engine", [name])
            case EXPRESS_SET:
              if (node.arguments.length === 2 &&
                  node.arguments[0].type === 'Literal' &&
                  node.arguments[0].value === 'view engine' &&
                  !definedExpressEngines) {
                transformed = true;
                const name = code.substring(node.arguments[1].start, node.arguments[1].end);
                magicString.appendRight(node.callee.object.end, `.engine(${name}, require(${name}).__express)`);
                return this.skip();
              }
            break;
            // app.engine('name', ...) causes opt-out of express rewrite
            case EXPRESS_ENGINE:
              definedExpressEngines = true;
            break;

            case FS_FN:
              if (node.arguments[0]) {
                staticChildValue = computePureStaticValue(node.arguments[0], true).result;
                // if it computes, then we start backtracking
                if (staticChildValue) {
                  staticChildNode = node.arguments[0];
                  return backtrack(this, parent);
                }
              }
            break;
          }
        }
      }
      else if (node.type === 'VariableDeclaration') {
        for (const decl of node.declarations) {
          if (!decl.init) continue;
          const computed = computePureStaticValue(decl.init, false).result;
          if (computed && 'value' in computed) {
            // var known = ...;
            if (decl.id.type === 'Identifier') {
              setKnownBinding(decl.id.name, computed.value);
            }
            // var { known } = ...;
            else if (decl.id.type === 'ObjectPattern') {
              for (const prop of decl.id.properties) {
                if (prop.type !== 'Property' ||
                    prop.key.type !== 'Identifier' ||
                    prop.value.type !== 'Identifier' ||
                    typeof computed.value !== 'object' ||
                    computed.value === null ||
                    !(prop.key.name in computed.value))
                  continue;
                setKnownBinding(prop.value.name, computed.value[prop.key.name]);
              }
            }
            if (typeof computed.value === 'string' && computed.value.match(absoluteRegEx)) {
              staticChildValue = computed;
              staticChildNode = decl.init;
              emitStaticChildAsset();
              return backtrack(this, parent);
            }
          }
        }
      }
      else if (node.type === 'AssignmentExpression') {
        const computed = computePureStaticValue(node.right, false).result;
        if (computed && 'value' in computed) {
          // var known = ...
          if (node.left.type === 'Identifier') {
            setKnownBinding(node.left.name, computed.value);
          }
          // var { known } = ...
          else if (node.left.type === 'ObjectPattern') {
            for (const prop of node.left.properties) {
              if (prop.type !== 'Property' ||
                  prop.key.type !== 'Identifier' ||
                  prop.value.type !== 'Identifier' ||
                  typeof computed.value !== 'object' ||
                  computed.value === null ||
                  !(prop.key.name in computed.value))
                continue;
              setKnownBinding(prop.value.name, computed.value[prop.key.name]);
            }
          }
          if (typeof computed.value === 'string' && computed.value.match(absoluteRegEx)) {
            staticChildValue = computed;
            staticChildNode = node.right;
            emitStaticChildAsset();
            return backtrack(this, parent);
          }
        }
        // require = require('esm')(...)
        if (!isESM && node.right.type === 'CallExpression' &&
            isStaticRequire(node.right.callee) &&
            node.right.callee.arguments[0].value === 'esm' &&
            node.left.type === 'Identifier' && node.left.name === 'require') {
          transformed = true;
          magicString.overwrite(node.start, node.end, '');
          return this.skip();
        }
      }
      // condition ? require('a') : require('b')
      // attempt to inline known branch based on variable analysis
      else if (!isESM && node.type === 'ConditionalExpression' && isStaticRequire(node.consequent) && isStaticRequire(node.alternate)) {
        const computed = computePureStaticValue(node.test, false).result;
        if (computed && 'value' in computed) {
          transformed = true;
          if (computed.value) {
            magicString.overwrite(node.start, node.end, code.substring(node.consequent.start, node.consequent.end));
          }
          else {
            magicString.overwrite(node.start, node.end, code.substring(node.alternate.start, node.alternate.end));
          }
          return this.skip();
        }
      }
    },
    leave (node, parent) {
      if (node.scope) {
        scope = scope.parent;
        for (const id in node.scope.declarations) {
          if (id in knownBindings) {
            if (knownBindings[id].shadowDepth > 0)
              knownBindings[id].shadowDepth--;
            else
              delete knownBindings[id];
          }
        }
      }

      // computing a static expression outward
      // -> compute and backtrack
      if (staticChildNode) {
        const curStaticValue = computePureStaticValue(node, true).result;
        if (curStaticValue) {
          if ('value' in curStaticValue && typeof curStaticValue.value !== 'symbol' ||
              typeof curStaticValue.then !== 'symbol' && typeof curStaticValue.else !== 'symbol') {
            staticChildValue = curStaticValue;
            staticChildNode = node;
            return;
          }
        }
        // no static value -> see if we should emit the asset if it exists
        emitStaticChildAsset();
      }
    }
  });

  if (!transformed)
    return this.callback(null, code, map);

  assetEmissionPromises.then(() => {
    code = magicString.toString();
    map = map || magicString.generateMap();
    if (map) {
      map.sources = [id];
      // map.sources = map.sources.map(name => name.indexOf('!') !== -1 ? name.split('!')[1] : name);
    }
    this.callback(null, code, map);
  });

  function emitStaticChildAsset (wrapRequire = false) {
    function validAssetEmission (assetPath) {
      if (!assetPath)
        return;
      // do not emit own id
      if (assetPath === id)
        return;
      let wildcardSuffix = '';
      if (assetPath.endsWith(path.sep))
        wildcardSuffix = path.sep;
      else if (assetPath.endsWith(path.sep + WILDCARD))
        wildcardSuffix = path.sep + WILDCARD;
      else if (assetPath.endsWith(WILDCARD))
        wildcardSuffix = WILDCARD;
      // do not emit __dirname
      if (assetPath === dir + wildcardSuffix)
        return;
      // do not emit cwd
      if (assetPath === cwd + wildcardSuffix)
        return;
      // do not emit node_modules
      if (assetPath.endsWith(path.sep + 'node_modules' + wildcardSuffix))
        return;
      // do not emit directories above __dirname
      if (dir.startsWith(assetPath.substr(0, assetPath.length - wildcardSuffix.length) + path.sep))
        return;
      // do not emit asset directories higher than the package base itself
      if ((wildcardSuffix || assetPath.indexOf(WILDCARD) !== -1) && pkgBase && !assetPath.startsWith(pkgBase)) {
        if (options.debugLog) {
          if (assetEmission(assetPath))
            console.log('Skipping asset emission of ' + assetPath.replace(wildcardRegEx, '*') + ' for ' + id + ' as it is outside the package base ' + pkgBase);
        }
        return;
      }
      // do not emit assets outside of the cwd
      if (!assetPath.startsWith(cwd)) {
        if (options.debugLog) {
          if (assetEmission(assetPath))
            console.log('Skipping asset emission of ' + assetPath.replace(wildcardRegEx, '*') + ' for ' + id + ' as it is outside the process directory ' + cwd);
        }
        return;
      }
      return assetEmission(assetPath);
    }
    function assetEmission (assetPath) {
      // verify the asset file / directory exists
      const wildcardIndex = assetPath.indexOf(WILDCARD);
      const dirIndex = wildcardIndex === -1 ? assetPath.length : assetPath.lastIndexOf(path.sep, assetPath.substr(0, wildcardIndex));
      const basePath = assetPath.substr(0, dirIndex);
      try {
        const stats = statSync(basePath);
        if (wildcardIndex !== -1 && stats.isFile())
          return;
        if (stats.isFile())
          return emitAsset;
        if (stats.isDirectory())
          return emitAssetDirectory;
      }
      catch (e) {
        return;
      }
    }
    if ('value' in staticChildValue) {
      let resolved;
      try { resolved = path.resolve(staticChildValue.value); }
      catch (e) {}
      let emitAsset;
      if (emitAsset = validAssetEmission(resolved)) {
        let inlineString = emitAsset(resolved, staticChildValue.wildcards);
        if (inlineString) {
          // require('bindings')(...)
          // -> require(require('bindings')(...))
          if (wrapRequire)
            inlineString = '__non_webpack_require__(' + inlineString + ')';
          magicString.overwrite(staticChildNode.start, staticChildNode.end, inlineString);
          transformed = true;
        }
      }
    }
    else {
      let resolvedThen;
      try { resolvedThen = path.resolve(staticChildValue.then); }
      catch (e) {}
      let resolvedElse;
      try { resolvedElse = path.resolve(staticChildValue.else); }
      catch (e) {}
      let emitAsset;
      // only inline conditionals when both branches are known same inlinings
      if (!wrapRequire && (emitAsset = validAssetEmission(resolvedThen)) && emitAsset === validAssetEmission(resolvedElse)) {
        const thenInlineString = emitAsset(resolvedThen);
        const elseInlineString = emitAsset(resolvedElse);
        if (thenInlineString && elseInlineString) {
          magicString.overwrite(
            staticChildNode.start, staticChildNode.end,
            `${code.substring(staticChildValue.test.start, staticChildValue.test.end)} ? ${thenInlineString} : ${elseInlineString}`
          );
          transformed = true;
        }
      }
    }
    staticChildNode = staticChildValue = undefined;
  }
};

module.exports.raw = true;
module.exports.getAssetPermissions = function(assetName) {
  if (lastState)
    return lastState.assetPermissions[assetName];
};
module.exports.getSymlinks = function() {
  if (lastState)
    return lastState.assetSymlinks;
};

module.exports.initAssetPermissionsCache = function (compilation) {
  const entryId = getEntryId(compilation);
  if (!entryId)
    return;
  const state = lastState = {
    entryId: entryId,
    assets: Object.create(null),
    assetNames: Object.create(null),
    assetPermissions: Object.create(null),
    assetSymlinks: Object.create(null),
    hadOptions: false
  };
  stateMap.set(compilation, state);
  compilation.cache.get('/RelocateLoader/AssetState/' + entryId, null, (err, _assetState) => {
    if (err) console.error(err);
    if (_assetState) {
      const parsedState = JSON.parse(_assetState);
      if (parsedState.assetPermissions)
        state.assetPermissions = parsedState.assetPermissions;
      if (parsedState.assetSymlinks)
        state.assetSymlinks = parsedState.assetSymlinks;
    }
  });
  compilation.compiler.hooks.afterCompile.tap("relocate-loader", compilation => {
    compilation.cache.store('/RelocateLoader/AssetState/' + entryId, null, JSON.stringify({
      assetPermissions: state.assetPermissions,
      assetSymlinks: state.assetSymlinks
    }), (err) => {
      if (err) console.error(err);
    });
  });
};
