const path = require('path');
const { readFileSync, readFile, stat, lstat, readlink, statSync, existsSync } = require('graceful-fs');
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
const handleWrappers = require('./utils/wrappers');
const handleSpecialCase = require('./utils/special-cases');
const { getOptions } = require("loader-utils");
const resolve = require('resolve');
const stage3 = require('acorn-stage3');
const mergeSourceMaps = require('./utils/merge-source-maps');
acorn = acorn.Parser.extend(stage3);

const staticPath = Object.assign({ default: path }, path);
const staticFs = { default: { existsSync }, existsSync };
const { UNKNOWN } = evaluate;

function isExpressionReference(node, parent) {
	if (parent.type === 'MemberExpression') return parent.computed || node === parent.object;

	// disregard the `bar` in { bar: foo }
	if (parent.type === 'Property' && node !== parent.value) return false;

	// disregard the `bar` in `class Foo { bar () {...} }`
	if (parent.type === 'MethodDefinition') return false;

	// disregard the `bar` in `export { foo as bar }`
  if (parent.type === 'ExportSpecifier' && node !== parent.local) return false;

  // disregard the `bar` in var bar = asdf
  if (parent.type === 'VariableDeclarator' && node.id === node) return false;

	return true;
}

const relocateRegEx = /(?<![a-z])(["']express|_\_dirname|_\_filename|require\.main|node-pre-gyp|bindings|define|pkginfo|require\(\s*[^'"]|__non_webpack_require__|process\.versions\.node)/;

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
    return resolve.sync(compilation.options.entry);
  }
  if (compilation.entries && compilation.entries.length) {
    try {
      return resolve.sync(compilation.entries[0].name || compilation.entries[0].resource, { filename: compilation.entries[0].context });
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
          return resolve.sync(entry[0].request, { filename: entry[0].context });
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

module.exports = async function (content, map) {
  if (this.cacheable)
    this.cacheable();
  this.async();
  const id = this.resourcePath;
  if (id.endsWith('.node')) {
    const options = getOptions(this);
    const assetState = getAssetState(options, this._compilation);
    const pkgBase = getPackageBase(this.resourcePath) || path.dirname(id);
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

  let code = content.toString();

  const specialCase = handleSpecialCase(id, code);

  if (!specialCase && (id.endsWith('.json') || !code.match(relocateRegEx)))
    return this.callback(null, code, map);

  const options = getOptions(this);
  const assetState = getAssetState(options, this._compilation);
  const entryId = assetState.entryId;

  // calculate the base-level package folder to load bindings from
  const pkgBase = getPackageBase(id);

  // unique symbol value to identify express instance in static analysis
  const EXPRESS = Symbol();
  const staticModules = Object.assign(Object.create(null), {
    express: {
      default: function () {
        return EXPRESS;
      }
    },
    path: staticPath,
    fs: staticFs,
    'node-pre-gyp': pregyp,
    'node-pre-gyp/lib/pre-binding': pregyp,
    'node-pre-gyp/lib/pre-binding.js': pregyp,
    'nbind': nbind
  });

  let staticBindingsInstance = false;
  function createBindings () {
    return (opts = {}) => {
      if (typeof opts === 'string')
        opts = { bindings: opts };
      if (!opts.path) {
        opts.path = true;
        staticBindingsInstance = true;
      }
      opts.module_root = pkgBase;
      return bindings(opts);
    };
  }

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

    const name = assetState.assets[assetPath] ||
        (assetState.assets[assetPath] = getUniqueAssetName(outName, assetPath, assetState.assetNames));

    // console.log('Emitting ' + assetPath + ' for module ' + id);
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
  const emitAssetDirectory = (assetDirPath) => {
    const dirName = path.basename(assetDirPath);
    const name = assetState.assets[assetDirPath] || (assetState.assets[assetDirPath] = getUniqueAssetName(dirName, assetDirPath, assetState.assetNames));
    assetState.assets[assetDirPath] = name;

    assetEmissionPromises = assetEmissionPromises.then(async () => {
      const files = await new Promise((resolve, reject) =>
        glob(assetDirPath + '/**/*', { mark: true, ignore: 'node_modules/**/*' }, (err, files) => err ? reject(err) : resolve(files))
      );
      await Promise.all(files.map(async file => {
        // dont emit empty directories or ".js" files
        if (file.endsWith('/') || file.endsWith('.js'))
          return;
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

    return "__dirname + '/" + relAssetPath(this, options) + JSON.stringify(name).slice(1, -1) + "'";
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

  if (specialCase) {
    transformed = specialCase({ code, ast, scope, magicString, emitAsset, emitAssetDirectory });
  }

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
      value: {
        // TODO: consider making this an outward trace?
        versions: {
          node: 10,
          [UNKNOWN]: true
        },
        [UNKNOWN]: true   
      }
    }
  });

  if (!isESM)
    knownBindings.require = {
      shadowDepth: 0
    };

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

  let nbindId, pregypId, bindingsId, resolveFromId;

  if (isESM) {
    for (const decl of ast.body) {
      if (decl.type === 'ImportDeclaration') {
        const source = decl.source.value;
        const staticModule = staticModules[source];
        if (staticModule) {
          for (const impt of decl.specifiers) {
            let bindingId;
            if (impt.type === 'ImportNamespaceSpecifier')
              setKnownBinding(bindingId = impt.local.name, staticModule);
            else if (impt.type === 'ImportDefaultSpecifier' && 'default' in staticModule)
              setKnownBinding(bindingId = impt.local.name, staticModule.default);
            else if (impt.type === 'ImportSpecifier' && impt.imported.name in staticModule)
              setKnownBinding(bindingId = impt.local.name, staticModule[impt.imported.name]);

            if (source === 'bindings')
              bindingsId = bindingId;
            else if (source === 'node-pre-gyp' || source === 'node-pre-gyp/lib/pre-binding' || source === 'node-pre-gyp/lib/pre-binding.js')
              pregypId = bindingId;
            else if (source === 'nbind')
              nbindId = bindingId;
            else if (source === 'resolve-from')
              resovleFromId = bindingId;
          }
        }
      }
    }
  }

  function requireWillFail (specifier) {
    return (specifier.startsWith('../') || specifier.startsWith('./')) && !existsSync(path.resolve(path.dirname(id), specifier));
  }

  function computeStaticValue (expr) {
    staticBindingsInstance = false;
    // function expression analysis disabled due to static-eval locals bug
    if (expr.type === 'FunctionExpression')
      return;

    const vars = Object.create(null);
    Object.keys(knownBindings).forEach(name => {
      const { shadowDepth, value } = knownBindings[name];
      if (shadowDepth === 0 && value !== undefined)
        vars[name] = value;
    });

    // evaluate returns undefined for non-statically-analyzable
    return evaluate(expr, vars);
  }

  // statically determinable leaves are tracked, and inlined when the
  // greatest parent statically known leaf computation corresponds to an asset path
  let staticChildNode, staticChildValue, staticChildValueBindingsInstance;

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

  // detect require(...)
  function isRequire (node) {
    return node &&
        node.type === 'CallExpression' &&
        (node.callee.type === 'Identifier' &&
          node.callee.name === 'require' &&
          knownBindings.require.shadowDepth === 0 ||
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'require');
  }

  function isAnalyzableRequire (expression) {
    if (expression && expression.type === 'Identifier' ||
        expression.type === 'MemberExpression' ||
        expression.type === 'CallExpression')
      return false;
    // "possibly" analyzable (this can be further restricted over time)
    return true;
  }

  if (options.wrapperCompatibility) {
    ({ ast, scope, transformed: wrapperTransformed } = handleWrappers(ast, scope, magicString, code.length));
    if (wrapperTransformed)
      transformed = true;
  }

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
        return this.skip();

      // detect asset leaf expression triggers (if not already)
      // __dirname,  __filename, binary only currently as well as require('bindings')(...)
      // Can add require.resolve, import.meta.url, even path-like environment variables
      if (node.type === 'Identifier' && isExpressionReference(node, parent)) {
        if (node.name === '__dirname' || node.name === '__filename' ||
            node.name === pregypId || node.name === bindingsId) {
          const binding = getKnownBinding(node.name);
          if (binding) {
            staticChildValue = computeStaticValue(node, false);
            // if it computes, then we start backtracking
            if (staticChildValue) {
              staticChildNode = node;
              staticChildValueBindingsInstance = staticBindingsInstance;
              return this.skip();
            }
          }
        }
        // __non_webpack_require__ -> eval('require')
        else if (node.name === '__non_webpack_require__' && parent.type !== 'UnaryExpression') {
          magicString.overwrite(node.start, node.end, 'eval("require")');
          transformed = true;
          return this.skip();
        }
      }
      // require
      else if (!isESM && isRequire(node)) {
        const expression = node.arguments[0];
        if (isStaticRequire(node) &&
            parent.type === 'CallExpression' &&
            parent.callee === node &&
            expression) {
          // require('bindings')('asdf')
          if (expression.value === 'bindings') {
            let staticValue = computeStaticValue(parent.arguments[0], true);
            let bindingsValue;
            if (staticValue && 'value' in staticValue) {
              try {
                bindingsValue = createBindings()(staticValue.value);
              }
              catch (err) {}
            }
            if (bindingsValue) {
              staticChildValue = { value: bindingsValue };
              staticChildNode = parent;
              staticChildValueBindingsInstance = staticBindingsInstance;
              return this.skip();
            }
          }
          // require('pkginfo')(module, ...string[])
          else if (expression.value === 'pkginfo' &&
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
        }
        else {
          // require(`${__dirname}...`) -> require(`./...`)
          if (expression &&
              expression.type === 'TemplateLiteral' &&
              expression.quasis[0].value.cooked.length === 0 &&
              expression.expressions[0].type === 'Identifier' &&
              expression.expressions[0].name === '__dirname' &&
              knownBindings.__dirname.shadowDepth === 0) {
            transformed = true;
            magicString.overwrite(expression.expressions[0].start - 2, expression.expressions[0].end + 1, '.');
            return this.skip();
          }
          // require(unknown || 'known') -> require('known')
          else if (expression && expression.type === 'LogicalExpression' &&
                expression.operator === '||' &&
                expression.left.type === 'Identifier' &&
                expression.right.type === 'Literal') {
            transformed = true;
            magicString.overwrite(expression.start, expression.end, code.substring(expression.right.start, expression.right.end));
            return this.skip();
          }
          // require(expression)
          else if (expression) {
            const computed = computeStaticValue(expression);
            // analyzable require expression
            if (computed) {
              if ('value' in computed) {
                transformed = true;
                magicString.overwrite(expression.start, expression.end, JSON.stringify(computed.value));
                return this.skip();
              }
              else {
                // branched require
                // if one branch is a not found, Webpack fails the whole build
                // so detect any not found now and inline the found branch
                if (typeof computed.then === 'string' && requireWillFail(computed.then)) {
                  transformed = true;
                  magicString.overwrite(expression.start, expression.end, JSON.stringify(computed.else));
                  return this.skip();
                }
                if (typeof computed.else === 'string' && requireWillFail(computed.else)) {
                  transformed = true;
                  magicString.overwrite(expression.start, expression.end, JSON.stringify(computed.then));
                  return this.skip();
                }
              }
            }
            // dynamic require -> outer require
            if (options.escapeNonAnalyzableRequires && !isAnalyzableRequire(expression)) {
              transformed = true;
              magicString.overwrite(node.callee.start, node.callee.end, "__non_webpack_require__");
              return this.skip();
            }
          }
        }
      }
      // nbind.init(...) -> require('./resolved.node')
      else if (nbindId && node.type === 'CallExpression' &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === nbindId &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'init') {
        const staticValue = computeStaticValue(node, false);
        let bindingInfo;
        if (staticValue && 'value' in staticValue)
          bindingInfo = staticValue.value;
        if (bindingInfo) {
          bindingInfo.path = path.relative(path.dirname(id), bindingInfo.path);
          transformed = true;
          const bindingPath = JSON.stringify(bindingInfo.path.replace(/\\/g, '/'));
          magicString.overwrite(node.start, node.end, `({ bind: require(${bindingPath}).NBind.bind_value, lib: require(${bindingPath}) })`);
          return this.skip();
        }
      }
      // resolveFrom(__dirname, ...) -> require.resolve(...)
      else if (resolveFromId && node.type === 'CallExpression' &&
          node.callee.type === 'Identifier' && node.callee.name === resolveFromId &&
          node.arguments.length === 2 && node.arguments[0].type === 'Identifier' &&
          node.arguments[0].name === '__dirname' && knownBindings.__dirname.shadowDepth === 0) {
        transformed = true;
        magicString.overwrite(node.start, node.arguments[0].end + 1, 'require.resolve(');
        return this.skip();
      }

      // require.main -> __non_webpack_require__.main
      else if (!isESM && node.type === 'MemberExpression' &&
               node.object.type === 'Identifier' &&
               node.object.name === 'require' &&
               knownBindings.require.shadowDepth === 0 &&
               node.property.type === 'Identifier' &&
               node.property.name === 'main' &&
               !node.computed) {
        if (parent && parent.type === 'BinaryExpression' && (parent.operator === '==' || parent.operator === '===')) {
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
        magicString.overwrite(node.object.start, node.object.end, '__non_webpack_require__');
        transformed = true;
        return this.skip();
      }
      else if (!isESM && options.escapeNonAnalyzableRequires && node.type === 'Property' && node.value.type === 'Identifier' &&
               node.value.name === 'require' && knownBindings.require.shadowDepth === 0) {
        magicString.overwrite(node.value.start, node.value.end, '__non_webpack_require__');
        transformed = true;
        return this.skip();
      }
      else if (node.type === 'VariableDeclaration') {
        for (const decl of node.declarations) {
          let binding;
          if (!isESM && isStaticRequire(decl.init)) {
            const source = decl.init.arguments[0].value;
            if (source === 'resolve-from')
              resolveFromId = decl.id.name;
            let staticModule;
            if (source === 'bindings')
              staticModule = { default: createBindings() };
            else
              staticModule = staticModules[source];
            if (staticModule) {
              // var known = require('known');
              if (decl.id.type === 'Identifier') {
                setKnownBinding(decl.id.name, staticModule.default);
                if (source === 'bindings')
                  bindingsId = decl.id.name;
                else if (source === 'node-pre-gyp' || source === 'node-pre-gyp/lib/pre-binding' || source === 'node-pre-gyp/lib/pre-binding.js')
                  pregypId = decl.id.name;
                else if (source === 'nbind')
                  nbindId = decl.id.name;
              }
              // var { known } = require('known);
              else if (decl.id.type === 'ObjectPattern') {
                for (const prop of decl.id.properties) {
                  if (prop.type !== 'Property' ||
                      prop.key.type !== 'Identifier' ||
                      prop.value.type !== 'Identifier' ||
                      !(prop.key.name in staticModule))
                    continue;
                  setKnownBinding(prop.value.name, staticModule[prop.key.name]);
                }
              }
            }
          }
          // var { knownProp } = known;
          else if (decl.id.type === 'ObjectPattern' &&
                   decl.init && decl.init.type === 'Identifier' &&
                   (binding = getKnownBinding(decl.init.name)) !== undefined) {
            for (const prop of decl.id.properties) {
              if (prop.type !== 'Property' ||
                prop.key.type !== 'Identifier' ||
                prop.value.type !== 'Identifier' ||
                typeof binding !== 'object' ||
                typeof binding !== 'function' ||
                binding === null ||
                !(prop.key.name in binding))
              continue;
              setKnownBinding(prop.value.name, binding[prop.key.name]);
            }
          }
          // var known = known.knownProp;
          else if (decl.id.type === 'Identifier' &&
                   decl.init) {
            const computed = computeStaticValue(decl.init);
            if (computed && !computed.test)
              setKnownBinding(decl.id.name, computed.value);
          }
        }
      }
      else if (node.type === 'AssignmentExpression') {
        // path = require('path')
        if (isStaticRequire(node.right) && node.right.arguments[0].value in staticModules &&
            node.left.type === 'Identifier' && scope.declarations[node.left.name]) {
          setKnownBinding(node.left.name, staticModules[node.right.arguments[0].value]);
        }
      }
      // condition ? require('a') : require('b')
      // attempt to inline known branch based on variable analysis
      else if (node.type === 'ConditionalExpression' && isStaticRequire(node.consequent) && isStaticRequire(node.alternate)) {
        const computed = computeStaticValue(node.test);
        if (computed && computed.value) {
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
      // Express templates:
      // app.set("view engine", [name]) -> app.engine([name], require([name]).__express).set("view engine", [name])
      else if (node.type === 'CallExpression' &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          getKnownBinding(node.callee.object.name) === EXPRESS &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'set' &&
          node.arguments.length === 2 &&
          node.arguments[0].type === 'Literal' &&
          node.arguments[0].value === 'view engine') {
        transformed = true;
        const name = code.substring(node.arguments[1].start, node.arguments[1].end);
        magicString.appendRight(node.callee.object.end, `.engine(${name}, require(${name}).__express)`);
        return this.skip();
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
        const curStaticValue = computeStaticValue(node, false);
        if (curStaticValue) {
          staticChildValue = curStaticValue;
          staticChildNode = node;
          staticChildValueBindingsInstance = staticBindingsInstance;
          return;
        }
        // Filter out emitting assets for a __filename call on its own
        if (staticChildNode.type === 'Identifier' && staticChildNode.name === '__filename' ||
            staticChildNode.type === 'ReturnStatement' && staticChildNode.argument.type === 'Identifier' &&
            staticChildNode.argument.name === '__filename') {
          staticChildNode = staticChildValue = undefined;
          return;
        }
        // no static value -> see if we should emit the asset if it exists
        // Currently we only handle files. In theory whole directories could also be emitted if necessary.
        if ('value' in staticChildValue) {
          const inlineString = getInlined(inlineType(staticChildValue.value), staticChildValue.value);
          if (inlineString) {
            magicString.overwrite(staticChildNode.start, staticChildNode.end, inlineString);
            transformed = true;
          }
        }
        else {
          const thenInlineType = inlineType(staticChildValue.then);
          const elseInlineType = inlineType(staticChildValue.else);
          // only inline conditionals when both branches are known inlinings
          if (thenInlineType && elseInlineType) {
            const thenInlineString = getInlined(thenInlineType, staticChildValue.then);
            const elseInlineString = getInlined(elseInlineType, staticChildValue.else);
            magicString.overwrite(
              staticChildNode.start, staticChildNode.end,
              `${code.substring(staticChildValue.test.start, staticChildValue.test.end)} ? ${thenInlineString} : ${elseInlineString}`
            );
            transformed = true;
          }
        }
        function inlineType (value) {
          let stats;
          if (typeof value === 'string') {
            try {
              stats = statSync(value);
            }
            catch (e) {}
          }
          else if (typeof value === 'boolean')
            return 'value';
          if (stats && stats.isFile())
            return 'file';
          else if (stats && stats.isDirectory())
            return 'directory';
        }
        function getInlined (inlineType, value) {
          switch (inlineType) {
            case 'value': return String(value);
            case 'file':
              let replacement = emitAsset(path.resolve(value));
              // require('bindings')(...)
              // -> require(require('bindings')(...))
              if (staticChildValueBindingsInstance)
                replacement = '__non_webpack_require__(' + replacement + ')';
              return replacement;
            case 'directory':
              return emitAssetDirectory(path.resolve(value));
          }
        }
        staticChildNode = staticChildValue = undefined;
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
