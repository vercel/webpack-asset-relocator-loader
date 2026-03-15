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
const resolve = require('resolve'); //resolve should be external to be patched by yarn
const mergeSourceMaps = require('./utils/merge-source-maps');
const os = require('os');
const nodeGypBuild = require('node-gyp-build');
const { pathToFileURL, fileURLToPath } = require('url');

acorn = acorn.Parser.extend(
  require("acorn-class-fields"),
  require("acorn-static-class-features"),
  require("acorn-private-class-elements")
);

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

function isVarLoop (node) {
  return node.type === 'ForStatement' || node.type === 'ForInStatement' || node.type === 'ForOfStatement';
}

function isLoop (node) {
  return node.type === 'ForStatement' || node.type === 'ForInStatement' || node.type === 'ForOfStatement' || node.type === 'WhileStatement' || node.type === 'DoWhileStatement';
}

const stateMap = new Map();
let lastState;

let stateId = 0;
function getAssetState (options, compilation) {
  let state = stateMap.get(compilation);
  if (!state) {
    stateMap.set(compilation, state = {
      stateId: ++stateId,
      entryIds: getEntryIds(compilation),
      assets: Object.create(null),
      assetNames: Object.create(null),
      assetMeta: Object.create(null),
      assetSymlinks: Object.create(null),
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

const flattenArray = arr => Array.prototype.concat.apply([], arr);
function getEntryIds (compilation) {
  if (compilation.options.entry) {
    if (typeof compilation.options.entry === 'string') {
      try {
        return [resolve.sync(compilation.options.entry, { extensions })];
      }
      catch (e) {
        return;
      }
    }
    else if (typeof compilation.options.entry === 'object') {
      try {
        return flattenArray(Object.values(compilation.options.entry)
          .map(entry => {
            if (typeof entry === "string") {
              return [entry];
            }

            if (entry && Array.isArray(entry.import)) {
              return entry.import;
            }

            return [];
          })
        ).map(entryString => resolve.sync(entryString, { extensions }));
      }
      catch (e) {
        return;
      }
    }
  }
}

function assetBase (outputAssetBase) {
  if (!outputAssetBase)
    return '';
  if (outputAssetBase.endsWith('/') || outputAssetBase.endsWith('\\'))
    return outputAssetBase;
  return outputAssetBase + '/';
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
const NODE_GYP_BUILD = Symbol();
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
  'node:path': undefined, // point to the same reference as "path" below
  'node-pre-gyp': pregyp,
  'node-pre-gyp/lib/pre-binding': pregyp,
  'node-pre-gyp/lib/pre-binding.js': pregyp,
  '@mapbox/node-pre-gyp': pregyp,
  '@mapbox/node-pre-gyp/lib/pre-binding': pregyp,
  '@mapbox/node-pre-gyp/lib/pre-binding.js': pregyp,
  'node-gyp-build': {
    default: NODE_GYP_BUILD
  },
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
staticModules["node:path"] = staticModules.path;

const globalBindings = {
  MONGOOSE_DRIVER_PATH: undefined,
  URL: URL
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

const excludeAssetExtensions = new Set(['.h', '.cmake', '.c', '.cpp']);
const excludeAssetFiles = new Set(['CHANGELOG.md', 'README.md', 'readme.md', 'changelog.md']);
let cwd;

function backtrack (self, parent) {
  if (!parent || parent.type !== 'ArrayExpression')
    return self.skip();
}

const absoluteRegEx = /^\/[^\/]+|^[a-z]:[\\/][^\\/]+/i;
function isAbsolutePathOrUrl(str) {
  if (str instanceof URL)
    return str.protocol === 'file:';
  if (typeof str === 'string') {
    if (str.startsWith('file:')) {
      try {
        new URL(str);
        return true;
      }
      catch {
        return false;
      }
    }
    return absoluteRegEx.test(str);
  }
  return false;
}

const BOUND_REQUIRE = Symbol();

function generateWildcardRequire(dir, wildcardPath, wildcardParam, wildcardBlocks, log) {
  const wildcardBlockIndex = wildcardBlocks.length;

  const wildcardPathNormalized = wildcardPath.split(path.sep).join(path.posix.sep)
  const dirNormalized = dir.split(path.sep).join(path.posix.sep)

  const trailingWildcard = wildcardPathNormalized.endsWith(WILDCARD);

  const wildcardIndex = wildcardPathNormalized.indexOf(WILDCARD);

  const wildcardPrefix = wildcardPathNormalized.substr(0, wildcardIndex);
  const wildcardSuffix = wildcardPathNormalized.substr(wildcardIndex + 1);
  const endPattern = wildcardSuffix ? '?(.@(js|json|node))' : '.@(js|json|node)';

  // sync to support no emission case
  if (log)
    console.log('Generating wildcard requires for ' + wildcardPathNormalized.replace(WILDCARD, '*'));
  let options = glob.sync(wildcardPrefix + '**' + wildcardSuffix + endPattern, { mark: true, ignore: 'node_modules/**/*' });

  if (!options.length)
    return;

  const optionConditions = options.map((file, index) => {
    const arg = JSON.stringify(file.substring(wildcardPrefix.length, file.lastIndexOf(wildcardSuffix)));
    let relPath = path.posix.relative(dirNormalized, file);
    if (!relPath.startsWith('../'))
      relPath = './' + relPath;
    let condition = index === 0 ? '  ' : '  else ';
    if (trailingWildcard && arg.endsWith('.js"'))
      condition += `if (arg === ${arg} || arg === ${arg.substr(0, arg.length - 4)}")`;
    else if (trailingWildcard && arg.endsWith('.json"'))
      condition += `if (arg === ${arg} || arg === ${arg.substr(0, arg.length - 6)}")`;
    else if (trailingWildcard && arg.endsWith('.node"'))
      condition += `if (arg === ${arg} || arg === ${arg.substr(0, arg.length - 6)}")`;
    else
      condition += `if (arg === ${arg})`;
    condition += ` return require(${JSON.stringify(relPath)});`;
    return condition;
  }).join('\n');

  wildcardBlocks.push(`function __ncc_wildcard$${wildcardBlockIndex} (arg) {\n${optionConditions}\n}`);
  return `__ncc_wildcard$${wildcardBlockIndex}(${wildcardParam})`;
}

function injectPathHook (compilation, outputAssetBase) {
  const esm = compilation.outputOptions.module;
  const { RuntimeModule, RuntimeGlobals } = compilation.compiler.webpack

  class AssetRelocatorLoaderRuntimeModule extends RuntimeModule {
    constructor({ relBase }) {
      super('asset-relocator-loader');

      this.relBase = relBase
    }

    generate() {
      const requireBase = `${esm ? "new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\\/\\/\\/\\w:/) ? 1 : 0, -1)" : '__dirname'} + ${JSON.stringify(this.relBase + '/' + assetBase(outputAssetBase))}`;

      return `if (typeof __webpack_require__ !== 'undefined') __webpack_require__.ab = ${requireBase};`
    }

    shouldIsolate() {
      return false;
    }
  }

  compilation.hooks.runtimeRequirementInTree
    .for(RuntimeGlobals.require)
    .tap('asset-relocator-loader', (chunk) => {
      let relBase = '';

      if (chunk.name) {
        relBase = path.relative(path.dirname(chunk.name), '.').replace(/\\/g, '/');

        if (relBase.length) {
          relBase = '/' + relBase;
        }
      }

      try {
        compilation.addRuntimeModule(chunk, new AssetRelocatorLoaderRuntimeModule({ relBase }));
      } catch (error) {
        console.error(error);
      }

      return true;
  });
}

module.exports = async function (content, map) {
  if (this.cacheable)
    this.cacheable();
  this.async();
  const id = this.resourcePath;
  const dir = path.dirname(id);

  // injection to set __webpack_require__.ab
  const options = getOptions(this) || {};

  injectPathHook(this._compilation, options.outputAssetBase);

  if (id.endsWith('.node')) {
    const assetState = getAssetState(options, this._compilation);
    const pkgBase = getPackageBase(this.resourcePath) || dir;
    await sharedlibEmit(pkgBase, assetState, assetBase(options.outputAssetBase), this.emitFile);

    let name;
    if (!(name = assetState.assets[id]))
      name = assetState.assets[id] = getUniqueAssetName(id.substr(pkgBase.length + 1).replace(/\\/g, '/'), id, assetState.assetNames);

    const permissions = await new Promise((resolve, reject) =>
      stat(id, (err, stats) => err ? reject(err) : resolve(stats.mode))
    );
    assetState.assetMeta[name] = { path: id, permissions };
    this.emitFile(assetBase(options.outputAssetBase) + name, content);

    this.callback(null, 'module.exports = __non_webpack_require__(__webpack_require__.ab + ' + JSON.stringify(name) + ')');
    return;
  }

  if (id.endsWith('.json'))
    return this.callback(null, code, map);

  let code = content.toString();

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
  const entryIds = assetState.entryIds;

  // calculate the base-level package folder to load bindings from
  const pkgBase = getPackageBase(id);

  const emitAsset = (assetPath) => {
    // JS assets to support require(assetPath) and not fs-based handling
    // NB package.json is ambiguous here...
    let outName = path.basename(assetPath);

    if (assetPath.endsWith('.node')) {
      // retain directory depth structure for binaries for rpath to work out
      if (pkgBase)
        outName = assetPath.substr(pkgBase.length + 1).replace(/\\/g, '/');
      // If the asset is a ".node" binary, then glob for possible shared
      // libraries that should also be included
      const nextPromise = sharedlibEmit(pkgBase, assetState, assetBase(options.outputAssetBase), this.emitFile);
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
        assetState.assetSymlinks[assetBase(options.outputAssetBase) + name] = path.relative(baseDir, path.resolve(baseDir, symlink));
      }
      else {
        assetState.assetMeta[assetBase(options.outputAssetBase) + name] = { path: assetPath, permissions: stats.mode };
        this.addDependency(assetPath);
        this.emitFile(assetBase(options.outputAssetBase) + name, source);
      }
    });
    return "__webpack_require__.ab + " + JSON.stringify(name).replace(/\\/g, '/');
  };
  const emitAssetDirectory = (wildcardPath, wildcards) => {
    const wildcardIndex = wildcardPath.indexOf(WILDCARD);
    const dirIndex = wildcardIndex === -1 ? wildcardPath.length : wildcardPath.lastIndexOf(path.sep, wildcardIndex);
    const assetDirPath = wildcardPath.substr(0, dirIndex);
    const patternPath = wildcardPath.substr(dirIndex);
    const wildcardPattern = patternPath.replace(wildcardRegEx, (match, index) => {
      return patternPath[index - 1] === path.sep ? '**/*' : '*/**/*';
    }) || '/**/*';
    if (options.debugLog)
      console.log('Emitting directory ' + assetDirPath + wildcardPattern + ' for static use in module ' + id);
    const dirName = path.basename(assetDirPath);

    const name = assetState.assets[assetDirPath] || (assetState.assets[assetDirPath] = getUniqueAssetName(dirName, assetDirPath, assetState.assetNames, true));
    assetState.assets[assetDirPath] = name;

    // this used to be async but had to switch to support no emission for no detection
    const files = glob.sync(assetDirPath + wildcardPattern, { mark: true, ignore: 'node_modules/**/*' }).filter(name =>
      !excludeAssetExtensions.has(path.extname(name)) &&
      !excludeAssetFiles.has(path.basename(name)) &&
      !name.endsWith('/')
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
          assetState.assetSymlinks[assetBase(options.outputAssetBase) + name + file.substr(assetDirPath.length)] = path.relative(baseDir, path.resolve(baseDir, symlink)).replace(/\\/g, '/');
        }
        else {
          assetState.assetMeta[assetBase(options.outputAssetBase) + name + file.substr(assetDirPath.length)] = { path: file, permissions: stats.mode };
          this.addDependency(file);
          this.emitFile(assetBase(options.outputAssetBase) + name + file.substr(assetDirPath.length), source);
        }
      }));
    });

    let assetExpressions = '';
    let firstPrefix = '';
    if (wildcards) {
      let curPattern = patternPath;
      let first = true;
      for (const wildcard of wildcards) {
        const nextWildcardIndex = curPattern.indexOf(WILDCARD);
        const wildcardPrefix = curPattern.substr(0, nextWildcardIndex);
        curPattern = curPattern.substr(nextWildcardIndex + 1);
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
        assetExpressions += " + \'" + JSON.stringify(curPattern.replace(/\\/g, '/')).slice(1, -1) + "'";
      }
    }
    return "__webpack_require__.ab + " + JSON.stringify((name + firstPrefix).replace(/\\/g, '/')) + assetExpressions;
  };

  let assetEmissionPromises = Promise.resolve();

  const magicString = new MagicString(code);

  let ast, isESM;
  try {
    ast = acorn.parse(code, { allowReturnOutsideFunction: true, ecmaVersion: 2020 });
    isESM = false;
  }
  catch (e) {}
  if (!ast) {
    try {
      ast = acorn.parse(code, { sourceType: 'module', ecmaVersion: 2020, allowAwaitOutsideFunction: true });
      isESM = true;
    }
    catch (e) {
      // Parser errors just skip analysis
      return this.callback(null, code, map);
    }
  }

  let scope = attachScopes(ast, 'scope');

  let transformed = false;

  const importMetaUrl = pathToFileURL(id).href;

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

  let wildcardBlocks = [];

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
    vars['import.meta'] = { url: importMetaUrl };
    // evaluate returns undefined for non-statically-analyzable
    const result = evaluate(expr, vars, computeBranches);
    return result;
  }

  // statically determinable leaves are tracked, and inlined when the
  // greatest parent statically known leaf computation corresponds to an asset path
  let staticChildNode, staticChildValue;

  // Express engine opt-out
  let definedExpressEngines = false;

  // track the name of any function that wraps "require"
  let boundRequireName;

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
      else if (node.type === 'MemberExpression' && node.object.type === 'MetaProperty' && node.object.meta.name === 'import' && node.object.property.name === 'meta' && (node.property.computed ? node.property.value : node.property.name) === 'url') {
        staticChildValue = { value: importMetaUrl };
        staticChildNode = node;
        return this.skip();
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
          if (computed.wildcards) {
            const wildcardPath = path.resolve(dir, computed.value);
            if (computed.wildcards.length === 1 && validAssetEmission(wildcardPath)) {
              const emission = generateWildcardRequire(dir, wildcardPath, code.substring(computed.wildcards[0].start, computed.wildcards[0].end), wildcardBlocks, options.debugLog);
              if (emission) {
                magicString.overwrite(node.start, node.end, emission);
                transformed = true;
                return this.skip();
              }
            }
          }
          else if (computed.value) {
            let inline;
            if (options.customEmit)
              inline = options.customEmit(computed.value, true);
            if (inline === undefined)
              inline = JSON.stringify(computed.value);
            if (inline !== false) {
              magicString.overwrite(expression.start, expression.end, inline);
              transformed = true;
              return this.skip();
            }
          }
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
          // if there is a custom emit and we have a string, then allow the custom emit to handle it
          if (typeof computed.value === 'string' && options.customEmit) {
            const customEmit = options.customEmit(computed.value, { id, isRequire: true });
            if (customEmit) {
              magicString.overwrite(node.start, node.end, '__non_webpack_require__(' + customEmit + ')');
              transformed = true;
              return this.skip();
            }
          }
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
            if (entryIds && entryIds.indexOf(id) !== -1) {
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
      // module.require handling
      else if (!isESM && node.type === 'MemberExpression' &&
               node.object.type === 'Identifier' &&
               node.object.name === 'module' &&
               'module' in knownBindings === false &&
               node.property.type === 'Identifier' &&
               !node.computed &&
               node.property.name === 'require') {
        magicString.overwrite(node.start, node.end, 'require');
        node.type = 'Identifier';
        node.name = 'require';
        transformed = true;
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
            // customRequireWrapper('...') -> wrapperMod(require('...'), '...')
            case BOUND_REQUIRE:
              if (node.arguments.length === 1 &&
                  node.arguments[0].type === 'Literal' &&
                  node.callee.type === 'Identifier' &&
                  knownBindings.require.shadowDepth === 0) {
                transformed = true;
                magicString.overwrite(node.callee.start, node.callee.end, 'require');
                magicString.appendRight(node.start, boundRequireName + '(');
                magicString.appendLeft(node.end, ', ' + code.substring(node.arguments[0].start, node.arguments[0].end) + ')');
                return this.skip();
              }
            break;
            // require('bindings')(...)
            case BINDINGS:
              if (node.arguments.length > 0) {
                const arg = computePureStaticValue(node.arguments[0], false).result;
                if (arg && arg.value) {
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
            case NODE_GYP_BUILD:
              if (node.arguments.length > 0) {
                const arg = computePureStaticValue(node.arguments[0], false).result;
                if (arg && arg.value) {
                  transformed = true;
                  let resolved;
                  try {
                    resolved = nodeGypBuild.path(arg.value);
                  }
                  catch (e) {}
                  if (resolved) {
                    staticChildValue = { value: resolved };
                    staticChildNode = node;
                    emitStaticChildAsset(path);
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
              if (node.arguments.length > 0) {
                const arg = computePureStaticValue(node.arguments[0], false).result;
                if (arg && arg.value) {
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
      else if (node.type === 'VariableDeclaration' && !isVarLoop(parent)) {
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
            if (isAbsolutePathOrUrl(computed.value)) {
              staticChildValue = computed;
              staticChildNode = decl.init;
              emitStaticChildAsset();
              return backtrack(this, parent);
            }
          }
        }
      }
      else if (node.type === 'AssignmentExpression' && !isLoop(parent)) {
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
          if (isAbsolutePathOrUrl(computed.value)) {
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
      // function p (x) { ...; var y = require(x); ...; return y;  } -> additional function p_mod (y) { ...; ...; return y; }
      else if (!isESM &&
               (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') &&
               (node.arguments || node.params)[0] && (node.arguments || node.params)[0].type === 'Identifier') {
        let fnName, args;
        if ((node.type === 'ArrowFunctionExpression' ||  node.type === 'FunctionExpression') &&
            parent.type === 'VariableDeclarator' &&
            parent.id.type === 'Identifier') {
          fnName = parent.id;
          args = node.arguments || node.params;
        }
        else if (node.id) {
          fnName = node.id;
          args = node.arguments || node.params;
        }
        if (fnName && node.body.body) {
          let requireDecl, requireDeclaration, returned = false;
          for (let i = 0; i < node.body.body.length; i++) {
            if (node.body.body[i].type === 'VariableDeclaration' && !requireDecl) {
              requireDecl = node.body.body[i].declarations.find(decl =>
                decl.id.type === 'Identifier' &&
                decl.init &&
                decl.init.type === 'CallExpression' &&
                decl.init.callee.type === 'Identifier' &&
                decl.init.callee.name === 'require' &&
                knownBindings.require.shadowDepth === 0 &&
                decl.init.arguments[0] &&
                decl.init.arguments[0].type === 'Identifier' &&
                decl.init.arguments[0].name === args[0].name
              );
              if (requireDecl)
                requireDeclaration = node.body.body[i];
            }
            if (requireDecl &&
                node.body.body[i].type === 'ReturnStatement' &&
                node.body.body[i].argument &&
                node.body.body[i].argument.type === 'Identifier' &&
                node.body.body[i].argument.name === requireDecl.id.name) {
              returned = true;
              break;
            }
          }
          if (returned) {
            let prefix = ';';
            const wrapArgs = node.type === 'ArrowFunctionExpression' && node.params[0].start === node.start;
            if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
              node = parent;
              prefix = ',';
            }
            boundRequireName = fnName.name + '$$mod';
            setKnownBinding(fnName.name, BOUND_REQUIRE);
            const newFn = prefix + code.substring(node.start, fnName.start) + boundRequireName + code.substring(fnName.end, args[0].start + !wrapArgs) +
                (wrapArgs ? '(' : '') + requireDecl.id.name + ', ' + code.substring(args[0].start, args[args.length - 1].end + !wrapArgs) + (wrapArgs ? ')' : '') +
                code.substring(args[0].end + !wrapArgs, requireDeclaration.start) + code.substring(requireDeclaration.end, node.end);
            magicString.appendRight(node.end, newFn);
          }
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
    if (wildcardBlocks.length)
      magicString.appendLeft(ast.body[0].start, wildcardBlocks.join('\n') + '\n');
    code = magicString.toString();
    map = map || magicString.generateMap();
    if (map) {
      map.sources = [id];
      // map.sources = map.sources.map(name => name.indexOf('!') !== -1 ? name.split('!')[1] : name);
    }
    this.callback(null, code, map);
  });

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
    if (!options.emitDirnameAll && (assetPath === dir + wildcardSuffix))
      return;
    // do not emit cwd
    if (!options.emitFilterAssetBaseAll && (assetPath === (options.filterAssetBase || cwd) + wildcardSuffix))
      return;
    // do not emit node_modules
    if (assetPath.endsWith(path.sep + 'node_modules' + wildcardSuffix))
      return;
    // do not emit directories above __dirname
    if (dir.startsWith(assetPath.substr(0, assetPath.length - wildcardSuffix.length) + path.sep))
      return;
    // do not emit asset directories higher than the node_modules base if a package
    if (pkgBase) {
      const nodeModulesBase = id.substr(0, id.indexOf(path.sep + 'node_modules')) + path.sep + 'node_modules' + path.sep;
      if (!assetPath.startsWith(nodeModulesBase)) {
        if (options.debugLog) {
          if (assetEmission(assetPath))
            console.log('Skipping asset emission of ' + assetPath.replace(wildcardRegEx, '*') + ' for ' + id + ' as it is outside the package base ' + pkgBase);
        }
        return;
      }
    }
    // otherwise, do not emit assets outside of the filterAssetBase
    else if (!assetPath.startsWith(options.filterAssetBase || cwd)) {
      if (options.debugLog) {
        if (assetEmission(assetPath))
          console.log('Skipping asset emission of ' + assetPath.replace(wildcardRegEx, '*') + ' for ' + id + ' as it is outside the filterAssetBase directory ' + (options.filterAssetBase || cwd));
      }
      return;
    }
    // finally, use custom emit filter
    if (options.customEmit) {
      const customEmit = options.customEmit(assetPath, { id, isRequire: false });
      if (customEmit === false)
        return;
      if (typeof customEmit === 'string')
        return () => customEmit;
    }
    return assetEmission(assetPath);
  }
  function assetEmission (assetPath) {
    // verify the asset file / directory exists
    const wildcardIndex = assetPath.indexOf(WILDCARD);
    const dirIndex = wildcardIndex === -1 ? assetPath.length : assetPath.lastIndexOf(path.sep, wildcardIndex);
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

  function resolveAbsolutePathOrUrl (value) {
    return value instanceof URL ? fileURLToPath(value) : value.startsWith('file:') ? fileURLToPath(new URL(value)) : path.resolve(value);
  }

  function emitStaticChildAsset (wrapRequire = false) {
    if (isAbsolutePathOrUrl(staticChildValue.value)) {
      let resolved;
      try { resolved = resolveAbsolutePathOrUrl(staticChildValue.value); }
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
    else if (isAbsolutePathOrUrl(staticChildValue.then) && isAbsolutePathOrUrl(staticChildValue.else)) {
      let resolvedThen;
      try { resolvedThen = resolveAbsolutePathOrUrl(staticChildValue.then); }
      catch (e) {}
      let resolvedElse;
      try { resolvedElse = resolveAbsolutePathOrUrl(staticChildValue.else); }
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
    else if (staticChildNode.type === 'ArrayExpression' && staticChildValue.value instanceof Array) {
      for (let i = 0; i < staticChildValue.value.length; i++) {
        const value = staticChildValue.value[i];
        const el = staticChildNode.elements[i];
        if (isAbsolutePathOrUrl(value)) {
          let resolved;
          try { resolved = resolveAbsolutePathOrUrl(value); }
          catch (e) {}
          let emitAsset;
          if (emitAsset = validAssetEmission(resolved)) {
            let inlineString = emitAsset(resolved);
            if (inlineString) {
              // require('bindings')(...)
              // -> require(require('bindings')(...))
              if (wrapRequire)
                inlineString = '__non_webpack_require__(' + inlineString + ')';
              magicString.overwrite(el.start, el.end, inlineString);
              transformed = true;
            }
          }
        }
      }
    }
    staticChildNode = staticChildValue = undefined;
  }
};

module.exports.raw = true;
module.exports.getAssetMeta = function (assetName, compilation) {
  const state = compilation ? stateMap.get(compilation) : lastState;
  if (state)
    return state.assetMeta[assetName];
};
module.exports.getSymlinks = function (compilation) {
  const state = compilation ? stateMap.get(compilation) : lastState;
  if (state)
    return lastState.assetSymlinks;
};

module.exports.initAssetCache = module.exports.initAssetMetaCache = function (compilation, outputAssetBase) {
  injectPathHook(compilation, outputAssetBase);
  const entryIds = getEntryIds(compilation);
  if (!entryIds)
    return;
  const state = lastState = {
    entryIds: entryIds,
    assets: Object.create(null),
    assetNames: Object.create(null),
    assetMeta: Object.create(null),
    assetSymlinks: Object.create(null),
    hadOptions: false
  };
  stateMap.set(compilation, state);
  const cache = compilation.getCache ? compilation.getCache() : compilation.cache;
  if (cache)
    cache.get('/RelocateLoader/AssetState/' + JSON.stringify(entryIds), null, (err, _assetState) => {
      if (err) console.error(err);
      if (_assetState) {
        const parsedState = JSON.parse(_assetState);
        if (parsedState.assetMeta)
          state.assetMeta = parsedState.assetMeta;
        if (parsedState.assetSymlinks)
          state.assetSymlinks = parsedState.assetSymlinks;
      }
    });
  compilation.compiler.hooks.afterCompile.tap("relocate-loader", compilation => {
    const cache = compilation.getCache ? compilation.getCache() : compilation.cache;
    if (cache)
      cache.store('/RelocateLoader/AssetState/' + JSON.stringify(entryIds), null, JSON.stringify({
        assetMeta: state.assetMeta,
        assetSymlinks: state.assetSymlinks
      }), (err) => {
        if (err) console.error(err);
      });
  });
};
