/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 595:
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),

/***/ 19:
/***/ ((module, exports, __webpack_require__) => {

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (() => {
	let warned = false;

	return () => {
		if (!warned) {
			warned = true;
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	};
})();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = __webpack_require__(222)(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


/***/ }),

/***/ 222:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = __webpack_require__(595);
	createDebug.destroy = destroy;

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;
		let enableOverride = null;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return '%';
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.useColors = createDebug.useColors();
		debug.color = createDebug.selectColor(namespace);
		debug.extend = extend;
		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

		Object.defineProperty(debug, 'enabled', {
			enumerable: true,
			configurable: false,
			get: () => enableOverride === null ? createDebug.enabled(namespace) : enableOverride,
			set: v => {
				enableOverride = v;
			}
		});

		// Env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		return debug;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	/**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/
	function destroy() {
		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;


/***/ }),

/***/ 997:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
	module.exports = __webpack_require__(19);
} else {
	module.exports = __webpack_require__(913);
}


/***/ }),

/***/ 913:
/***/ ((module, exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

const tty = __webpack_require__(867);
const util = __webpack_require__(669);

/**
 * This is the Node.js implementation of `debug()`.
 */

exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.destroy = util.deprecate(
	() => {},
	'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
);

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
	// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
	// eslint-disable-next-line import/no-extraneous-dependencies
	const supportsColor = __webpack_require__(568);

	if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
		exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	}
} catch (error) {
	// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(key => {
	return /^debug_/i.test(key);
}).reduce((obj, key) => {
	// Camel-case
	const prop = key
		.substring(6)
		.toLowerCase()
		.replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});

	// Coerce string value into JS value
	let val = process.env[key];
	if (/^(yes|on|true|enabled)$/i.test(val)) {
		val = true;
	} else if (/^(no|off|false|disabled)$/i.test(val)) {
		val = false;
	} else if (val === 'null') {
		val = null;
	} else {
		val = Number(val);
	}

	obj[prop] = val;
	return obj;
}, {});

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
	return 'colors' in exports.inspectOpts ?
		Boolean(exports.inspectOpts.colors) :
		tty.isatty(process.stderr.fd);
}

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	const {namespace: name, useColors} = this;

	if (useColors) {
		const c = this.color;
		const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
		const prefix = `  ${colorCode};1m${name} \u001B[0m`;

		args[0] = prefix + args[0].split('\n').join('\n' + prefix);
		args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
	} else {
		args[0] = getDate() + name + ' ' + args[0];
	}
}

function getDate() {
	if (exports.inspectOpts.hideDate) {
		return '';
	}
	return new Date().toISOString() + ' ';
}

/**
 * Invokes `util.format()` with the specified arguments and writes to stderr.
 */

function log(...args) {
	return process.stderr.write(util.format(...args) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	if (namespaces) {
		process.env.DEBUG = namespaces;
	} else {
		// If you set a process.env field to null or undefined, it gets cast to the
		// string 'null' or 'undefined'. Just delete instead.
		delete process.env.DEBUG;
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
	return process.env.DEBUG;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init(debug) {
	debug.inspectOpts = {};

	const keys = Object.keys(exports.inspectOpts);
	for (let i = 0; i < keys.length; i++) {
		debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
}

module.exports = __webpack_require__(222)(exports);

const {formatters} = module.exports;

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts)
		.split('\n')
		.map(str => str.trim())
		.join(' ');
};

/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */

formatters.O = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts);
};


/***/ }),

/***/ 24:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/**
 * Module dependencies.
 */

const assert = __webpack_require__(357);
const debug = __webpack_require__(997)('ffi:_ForeignFunction');
const ref = __webpack_require__(859);
const bindings = __webpack_require__(207);
const POINTER_SIZE = ref.sizeof.pointer;
const FFI_ARG_SIZE = bindings.FFI_ARG_SIZE;


function ForeignFunction (cif, funcPtr, returnType, argTypes) {
  debug('creating new ForeignFunction', funcPtr);

  const numArgs = argTypes.length;
  const argsArraySize = numArgs * POINTER_SIZE;

  // "result" must point to storage that is sizeof(long) or larger. For smaller
  // return value sizes, the ffi_arg or ffi_sarg integral type must be used to
  // hold the return value
  const resultSize = returnType.size >= ref.sizeof.long ? returnType.size : FFI_ARG_SIZE;
  assert(resultSize > 0);

  /**
   * This is the actual JS function that gets returned.
   * It handles marshalling input arguments into C values,
   * and unmarshalling the return value back into a JS value
   */

  const proxy = function () {
    debug('invoking proxy function');

    if (arguments.length !== numArgs) {
      throw new TypeError('Expected ' + numArgs +
          ' arguments, got ' + arguments.length);
    }

    // storage buffers for input arguments and the return value
    const result = Buffer.alloc(resultSize);
    const argsList = Buffer.alloc(argsArraySize);

    // write arguments to storage areas
    let i;
    try {
      for (i = 0; i < numArgs; i++) {
        const argType = argTypes[i];
        const val = arguments[i];
        const valPtr = ref.alloc(argType, val);
        argsList.writePointer(valPtr, i * POINTER_SIZE);
      }
    } catch (e) {
      // counting arguments from 1 is more human readable
      i++;
      e.message = 'error setting argument ' + i + ' - ' + e.message;
      throw e;
    }

    // invoke the `ffi_call()` function
    bindings.ffi_call(cif, funcPtr, result, argsList);

    result.type = returnType;
    return result.deref();
  };

  /**
   * The asynchronous version of the proxy function.
   */

  proxy.async = function () {
    debug('invoking async proxy function');

    const argc = arguments.length;
    if (argc !== numArgs + 1) {
      throw new TypeError('Expected ' + (numArgs + 1) +
          ' arguments, got ' + argc);
    }

    const callback = arguments[argc - 1];
    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function as argument number: ' +
          (argc - 1));
    }

    // storage buffers for input arguments and the return value
    const result = Buffer.alloc(resultSize);
    const argsList = Buffer.alloc(argsArraySize);

    // write arguments to storage areas
    let i;
    try {
      for (i = 0; i < numArgs; i++) {
        const argType = argTypes[i];
        const val = arguments[i];
        const valPtr = ref.alloc(argType, val);
        argsList.writePointer(valPtr, i * POINTER_SIZE);
      }
    } catch (e) {
      e.message = 'error setting argument ' + i + ' - ' + e.message;
      return process.nextTick(callback.bind(null, e));
    }

    // invoke the `ffi_call()` function asynchronously
    bindings.ffi_call_async(cif, funcPtr, result, argsList, function (err) {
      // make sure that the 4 Buffers passed in above don't get GC'd while we're
      // doing work on the thread pool...
      [ cif, funcPtr, argsList ].map(() => {});

      // now invoke the user-provided callback function
      if (err) {
        callback(err);
      } else {
        result.type = returnType;
        callback(null, result.deref());
      }
    });
  }

  return proxy;
}

module.exports = ForeignFunction;


/***/ }),

/***/ 207:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const path = __webpack_require__(622);
const ref = __webpack_require__(859);
const assert = __webpack_require__(357);

assert(ref.instance);

const bindings = require(__webpack_require__.ab + "build/Release/ffi_bindings.node");
module.exports = bindings.initializeBindings(ref.instance);


/***/ }),

/***/ 145:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/**
 * Module dependencies.
 */

const ref = __webpack_require__(859);
const CIF = __webpack_require__(74);
const assert = __webpack_require__(357);
const debug = __webpack_require__(997)('ffi:Callback');
const _Callback = __webpack_require__(207).Callback;

// Function used to report errors to the current process event loop,
// When user callback function gets gced.
function errorReportCallback (err) {
  if (err) {
    process.nextTick(function () {
      if (typeof err === 'string') {
        throw new Error(err);
      } else {
        throw err;
      }
    })
  }
}

/**
 * Turns a JavaScript function into a C function pointer.
 * The function pointer may be used in other C functions that
 * accept C callback functions.
 */

function Callback (retType, argTypes, abi, func) {
  debug('creating new Callback');

  if (typeof abi === 'function') {
    func = abi;
    abi = undefined;
  }

  // check args
  assert(!!retType, 'expected a return "type" object as the first argument');
  assert(Array.isArray(argTypes), 'expected Array of arg "type" objects as the second argument');
  assert.equal(typeof func, 'function', 'expected a function as the third argument');

  // normalize the "types" (they could be strings, so turn into real type
  // instances)
  retType = ref.coerceType(retType);
  argTypes = argTypes.map(ref.coerceType);

  // create the `ffi_cif *` instance
  const cif = CIF(retType, argTypes, abi);
  const argc = argTypes.length;

  const callback = _Callback(cif, retType.size, argc, errorReportCallback, (retval, params) => {
    debug('Callback function being invoked')
    try {
      const args = [];
      for (var i = 0; i < argc; i++) {
        const type = argTypes[i];
        const argPtr = params.readPointer(i * ref.sizeof.pointer, type.size);
        argPtr.type = type;
        args.push(argPtr.deref());
      }

      // Invoke the user-given function
      const result = func.apply(null, args);
      try {
        ref.set(retval, 0, result, retType);
      } catch (e) {
        e.message = 'error setting return value - ' + e.message;
        throw e;
      }
    } catch (e) {
      return e;
    }
  });
  
  // store reference to the CIF Buffer so that it doesn't get
  // garbage collected before the callback Buffer does
  callback._cif = cif;
  return callback;
}

module.exports = Callback;


/***/ }),

/***/ 74:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/**
 * Module dependencies.
 */

var Type = __webpack_require__(979);
const assert = __webpack_require__(357);
const debug = __webpack_require__(997)('ffi:cif');
const ref = __webpack_require__(859);
const bindings = __webpack_require__(207);
const POINTER_SIZE = ref.sizeof.pointer;
const ffi_prep_cif = bindings.ffi_prep_cif;
const FFI_CIF_SIZE = bindings.FFI_CIF_SIZE;
const FFI_DEFAULT_ABI = bindings.FFI_DEFAULT_ABI;
  // status codes
const FFI_OK = bindings.FFI_OK;
const FFI_BAD_TYPEDEF = bindings.FFI_BAD_TYPEDEF;
const FFI_BAD_ABI = bindings.FFI_BAD_ABI;

/**
 * JS wrapper for the `ffi_prep_cif` function.
 * Returns a Buffer instance representing a `ffi_cif *` instance.
 */

const cifs = [];
function CIF (rtype, types, abi) {
  debug('creating `ffi_cif *` instance');

  // the return and arg types are expected to be coerced at this point...
  assert(!!rtype, 'expected a return "type" object as the first argument');
  assert(Array.isArray(types), 'expected an Array of arg "type" objects as the second argument');

  // the buffer that will contain the return `ffi_cif *` instance
  const cif = Buffer.alloc(FFI_CIF_SIZE);

  const numArgs = types.length;
  const _argtypesptr = Buffer.alloc(numArgs * POINTER_SIZE);
  const _rtypeptr = Type(rtype);

  for (var i = 0; i < numArgs; i++) {
    const type = types[i];
    const ffiType = Type(type);

    _argtypesptr.writePointer(ffiType, i * POINTER_SIZE);
  }

  // prevent GC of the arg type and rtn type buffers (not sure if this is required)
  cif.rtnTypePtr = _rtypeptr;
  cif.argTypesPtr = _argtypesptr;

  if (typeof abi === 'undefined') {
    debug('no ABI specified (this is OK), using FFI_DEFAULT_ABI');
    abi = FFI_DEFAULT_ABI;
  }

  const status = ffi_prep_cif(cif, numArgs, _rtypeptr, _argtypesptr, abi);

  if (status !== FFI_OK) {
    switch (status) {
      case FFI_BAD_TYPEDEF:
      {
        const err = new Error('ffi_prep_cif() returned an FFI_BAD_TYPEDEF error');
        err.code = 'FFI_BAD_TYPEDEF';
        err.errno = status;
        throw err;
      }
      case FFI_BAD_ABI:
      {
        const err = new Error('ffi_prep_cif() returned an FFI_BAD_ABI error');
        err.code = 'FFI_BAD_ABI';
        err.errno = status;
        throw err;
      }
      default:
        throw new Error('ffi_prep_cif() returned an error: ' + status);
    }
  }

  if (debug.enabled || `${process.env.DEBUG}`.match(/\bffi\b/))
    cifs.push(cif);
  return cif;
}

module.exports = CIF;


/***/ }),

/***/ 409:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/**
 * Module dependencies.
 */

const Type = __webpack_require__(979);
const assert = __webpack_require__(357);
const debug = __webpack_require__(997)('ffi:cif_var');
const ref = __webpack_require__(859);
const bindings = __webpack_require__(207);
const POINTER_SIZE = ref.sizeof.pointer;
const ffi_prep_cif_var = bindings.ffi_prep_cif_var;
const FFI_CIF_SIZE = bindings.FFI_CIF_SIZE;
const FFI_DEFAULT_ABI = bindings.FFI_DEFAULT_ABI;
  // status codes
const FFI_OK = bindings.FFI_OK;
const FFI_BAD_TYPEDEF = bindings.FFI_BAD_TYPEDEF;
const FFI_BAD_ABI = bindings.FFI_BAD_ABI;

/**
 * JS wrapper for the `ffi_prep_cif_var` function.
 * Returns a Buffer instance representing a variadic `ffi_cif *` instance.
 */

function CIF_var (rtype, types, numFixedArgs, abi) {
  debug('creating `ffi_cif *` instance with `ffi_prep_cif_var()`');

  // the return and arg types are expected to be coerced at this point...
  assert(!!rtype, 'expected a return "type" object as the first argument');
  assert(Array.isArray(types), 'expected an Array of arg "type" objects as the second argument');
  assert(numFixedArgs >= 1, 'expected the number of fixed arguments to be at least 1');

  // the buffer that will contain the return `ffi_cif *` instance
  const cif = Buffer.alloc(FFI_CIF_SIZE);

  const numTotalArgs = types.length;
  const _argtypesptr = Buffer.alloc(numTotalArgs * POINTER_SIZE);
  const _rtypeptr = Type(rtype);

  for (let i = 0; i < numTotalArgs; i++) {
    const ffiType = Type(types[i]);
    _argtypesptr.writePointer(ffiType, i * POINTER_SIZE);
  }

  // prevent GC of the arg type and rtn type buffers (not sure if this is required)
  cif.rtnTypePtr = _rtypeptr;
  cif.argTypesPtr = _argtypesptr;

  if (typeof abi === 'undefined') {
    debug('no ABI specified (this is OK), using FFI_DEFAULT_ABI');
    abi = FFI_DEFAULT_ABI;
  }

  const status = ffi_prep_cif_var(cif, numFixedArgs, numTotalArgs, _rtypeptr, _argtypesptr, abi);

  if (status !== FFI_OK) {
    switch (status) {
      case FFI_BAD_TYPEDEF:
      {
        const err = new Error('ffi_prep_cif_var() returned an FFI_BAD_TYPEDEF error');
        err.code = 'FFI_BAD_TYPEDEF';
        err.errno = status;
        throw err;
      }
      case FFI_BAD_ABI:
      {
        const err = new Error('ffi_prep_cif_var() returned an FFI_BAD_ABI error');
        err.code = 'FFI_BAD_ABI';
        err.errno = status;
        throw err;
      }
      default:
      {
        const err = new Error('ffi_prep_cif_var() returned an error: ' + status);
        err.errno = status;
        throw err;
      }
    }
  }

  return cif;
}

module.exports = CIF_var;


/***/ }),

/***/ 61:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/**
 * Module dependencies.
 */

const ForeignFunction = __webpack_require__(18);
const assert = __webpack_require__(357);
const debug = __webpack_require__(997)('ffi:DynamicLibrary');
const bindings = __webpack_require__(207);
const funcs = bindings.StaticFunctions;
const ref = __webpack_require__(859);
const read  = __webpack_require__(747).readFileSync;

// typedefs
const int = ref.types.int;
const voidPtr = ref.refType(ref.types.void);

const dlopen  = ForeignFunction(funcs.dlopen,  voidPtr, [ 'string', int ]);
const dlclose = ForeignFunction(funcs.dlclose, int,     [ voidPtr ]);
const dlsym   = ForeignFunction(funcs.dlsym,   voidPtr, [ voidPtr, 'string' ]);
const dlerror = ForeignFunction(funcs.dlerror, 'string', [ ]);

/**
 * `DynamicLibrary` loads and fetches function pointers for dynamic libraries
 * (.so, .dylib, etc). After the libray's function pointer is acquired, then you
 * call `get(symbol)` to retreive a pointer to an exported symbol. You need to
 * call `get___()` on the pointer to dereference it into its actual value, or
 * turn the pointer into a callable function with `ForeignFunction`.
 */

function DynamicLibrary (path, mode) {
  if (!(this instanceof DynamicLibrary)) {
    return new DynamicLibrary(path, mode);
  }
  debug('new DynamicLibrary()', path, mode);

  if (null == mode) {
    mode = DynamicLibrary.FLAGS.RTLD_LAZY;
  }

  this._path = path;
  this._handle = dlopen(path, mode);
  assert(Buffer.isBuffer(this._handle), 'expected a Buffer instance to be returned from `dlopen()`');

  if (this._handle.isNull()) {
    var err = this.error();

    // THIS CODE IS BASED ON GHC Trac ticket #2615
    // http://hackage.haskell.org/trac/ghc/attachment/ticket/2615

    // On some systems (e.g., Gentoo Linux) dynamic files (e.g. libc.so)
    // contain linker scripts rather than ELF-format object code. This
    // code handles the situation by recognizing the real object code
    // file name given in the linker script.

    // If an "invalid ELF header" error occurs, it is assumed that the
    // .so file contains a linker script instead of ELF object code.
    // In this case, the code looks for the GROUP ( ... ) linker
    // directive. If one is found, the first file name inside the
    // parentheses is treated as the name of a dynamic library and the
    // code attempts to dlopen that file. If this is also unsuccessful,
    // an error message is returned.

    // see if the error message is due to an invalid ELF header
    let match;

    if (match = err.match(/^(([^ \t()])+\.so([^ \t:()])*):([ \t])*/)) {
      const content = read(match[1], 'ascii');
      // try to find a GROUP ( ... ) command
      if (match = content.match(/GROUP *\( *(([^ )])+)/)){
        return DynamicLibrary.call(this, match[1], mode);
      }
    }

    throw new Error('Dynamic Linking Error: ' + err);
  }
}
module.exports = DynamicLibrary;

/**
 * Set the exported flags from "dlfcn.h"
 */

DynamicLibrary.FLAGS = {};
Object.keys(bindings).forEach(function (k) {
  if (!/^RTLD_/.test(k)) return;
  const desc = Object.getOwnPropertyDescriptor(bindings, k);
  Object.defineProperty(DynamicLibrary.FLAGS, k, desc);
});


/**
 * Close this library, returns the result of the dlclose() system function.
 */

DynamicLibrary.prototype.close = function () {
  debug('dlclose()');
  return dlclose(this._handle);
}

/**
 * Get a symbol from this library, returns a Pointer for (memory address of) the symbol
 */

DynamicLibrary.prototype.get = function (symbol) {
  debug('dlsym()', symbol);
  assert.strictEqual('string', typeof symbol);

  const ptr = dlsym(this._handle, symbol);
  assert(Buffer.isBuffer(ptr));

  if (ptr.isNull()) {
    throw new Error('Dynamic Symbol Retrieval Error: ' + this.error());
  }

  ptr.name = symbol;

  return ptr;
}

/**
 * Returns the result of the dlerror() system function
 */
DynamicLibrary.prototype.error = function error () {
  debug('dlerror()');
  return dlerror();
}

/**
 * Returns the path originally passed to the constructor
 */
DynamicLibrary.prototype.path = function error () {
  return this._path;
}


/***/ }),

/***/ 21:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const DynamicLibrary = __webpack_require__(61);
const ForeignFunction = __webpack_require__(18);
const bindings = __webpack_require__(207);
const funcs = bindings.StaticFunctions;
const ref = __webpack_require__(859);
const int = ref.types.int;
const intPtr = ref.refType(int);
let errno = null;

if (process.platform == 'win32') {
  const _errno = DynamicLibrary('msvcrt.dll').get('_errno');
  const errnoPtr = ForeignFunction(_errno, intPtr, []);
  errno = function() {
    return errnoPtr().deref();
  };
} else {
  errno = ForeignFunction(funcs._errno, 'int', []);
}

module.exports = errno;


/***/ }),

/***/ 307:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


/**
 * Module dependencies.
 */

const ref = __webpack_require__(859);
const assert = __webpack_require__(357);
const debug = __webpack_require__(997)('ffi:ffi');
const Struct = __webpack_require__(835)(ref);
const bindings = __webpack_require__(207);

/**
 * Export some of the properties from the "bindings" file.
 */

['FFI_TYPES',
 'FFI_OK', 'FFI_BAD_TYPEDEF', 'FFI_BAD_ABI',
 'FFI_DEFAULT_ABI', 'FFI_FIRST_ABI', 'FFI_LAST_ABI', 'FFI_SYSV', 'FFI_UNIX64',
 'FFI_WIN64', 'FFI_VFP', 'FFI_STDCALL', 'FFI_THISCALL', 'FFI_FASTCALL',
 'RTLD_LAZY', 'RTLD_NOW', 'RTLD_LOCAL', 'RTLD_GLOBAL', 'RTLD_NOLOAD',
 'RTLD_NODELETE', 'RTLD_FIRST', 'RTLD_NEXT', 'RTLD_DEFAULT', 'RTLD_SELF',
 'RTLD_MAIN_ONLY', 'FFI_MS_CDECL'].forEach(prop => {
  if (!bindings.hasOwnProperty(prop)) {
    return debug('skipping exporting of non-existant property', prop);
  }
  const desc = Object.getOwnPropertyDescriptor(bindings, prop);
  Object.defineProperty(exports, prop, desc);
});

/**
 * Set the `ffi_type` property on the built-in types.
 */

Object.keys(bindings.FFI_TYPES).forEach(name => {
  const type = bindings.FFI_TYPES[name];
  type.name = name;
  if (name === 'pointer')
    return; // there is no "pointer" type...
  ref.types[name].ffi_type = type;
});

// make `size_t` use the "ffi_type_pointer"
ref.types.size_t.ffi_type = bindings.FFI_TYPES.pointer;

// make `Utf8String` use "ffi_type_pointer"
const CString = ref.types.CString || ref.types.Utf8String;
CString.ffi_type = bindings.FFI_TYPES.pointer;

// make `Object` use the "ffi_type_pointer"
ref.types.Object.ffi_type = bindings.FFI_TYPES.pointer;

// libffi is weird when it comes to long data types (defaults to 64-bit),
// so we emulate here, since some platforms have 32-bit longs and some
// platforms have 64-bit longs.
switch (ref.sizeof.long) {
  case 4:
    ref.types.ulong.ffi_type = bindings.FFI_TYPES.uint32;
    ref.types.long.ffi_type = bindings.FFI_TYPES.int32;
    break;
  case 8:
    ref.types.ulong.ffi_type = bindings.FFI_TYPES.uint64;
    ref.types.long.ffi_type = bindings.FFI_TYPES.int64;
    break;
  default:
    throw new Error('unsupported "long" size: ' + ref.sizeof.long);
}

/**
 * Alias the "ref" types onto ffi's exports, for convenience...
 */

exports.types = ref.types;

// Include our other modules
exports.version = bindings.version;
exports.CIF = __webpack_require__(74);
exports.CIF_var = __webpack_require__(409);
exports.Function = __webpack_require__(637);
exports.ForeignFunction = __webpack_require__(18);
exports.VariadicForeignFunction = __webpack_require__(887);
exports.DynamicLibrary = __webpack_require__(61);
exports.Library = __webpack_require__(458);
exports.Callback = __webpack_require__(145);
exports.errno = __webpack_require__(21);
exports.ffiType = __webpack_require__(979);

// the shared library extension for this platform
exports.LIB_EXT = exports.Library.EXT;

// the FFI_TYPE struct definition
exports.FFI_TYPE = exports.ffiType.FFI_TYPE;


/***/ }),

/***/ 18:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/**
 * Module dependencies.
 */

const CIF = __webpack_require__(74);
const _ForeignFunction = __webpack_require__(24);
const debug = __webpack_require__(997)('ffi:ForeignFunction');
const assert = __webpack_require__(357);
const ref = __webpack_require__(859);

/**
 * Represents a foreign function in another library. Manages all of the aspects
 * of function execution, including marshalling the data parameters for the
 * function into native types and also unmarshalling the return from function
 * execution.
 */

function ForeignFunction (funcPtr, returnType, argTypes, abi) {
  debug('creating new ForeignFunction', funcPtr);

  // check args
  assert(Buffer.isBuffer(funcPtr), 'expected Buffer as first argument');
  assert(!!returnType, 'expected a return "type" object as the second argument');
  assert(Array.isArray(argTypes), 'expected Array of arg "type" objects as the third argument');

  // normalize the "types" (they could be strings,
  // so turn into real type instances)
  returnType = ref.coerceType(returnType);
  argTypes = argTypes.map(ref.coerceType);

  // create the `ffi_cif *` instance
  const cif = CIF(returnType, argTypes, abi);

  // create and return the JS proxy function
  return _ForeignFunction(cif, funcPtr, returnType, argTypes);
}

module.exports = ForeignFunction;


/***/ }),

/***/ 887:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/**
 * Module dependencies.
 */

const CIF_var = __webpack_require__(409);
const Type = __webpack_require__(979);
const _ForeignFunction = __webpack_require__(24);
const assert = __webpack_require__(357);
const debug = __webpack_require__(997)('ffi:VariadicForeignFunction');
const ref = __webpack_require__(859);
const bindings = __webpack_require__(207);
const POINTER_SIZE = ref.sizeof.pointer;
const FFI_ARG_SIZE = bindings.FFI_ARG_SIZE;

/**
 * For when you want to call to a C function with variable amount of arguments.
 * i.e. `printf()`.
 *
 * This function takes care of caching and reusing ForeignFunction instances that
 * contain the same ffi_type argument signature.
 */

function VariadicForeignFunction (funcPtr, returnType, fixedArgTypes, abi) {
  debug('creating new VariadicForeignFunction', funcPtr);

  // the cache of ForeignFunction instances that this
  // VariadicForeignFunction has created so far
  const cache = {};

  // check args
  assert(Buffer.isBuffer(funcPtr), 'expected Buffer as first argument');
  assert(!!returnType, 'expected a return "type" object as the second argument');
  assert(Array.isArray(fixedArgTypes), 'expected Array of arg "type" objects as the third argument');

  const numFixedArgs = fixedArgTypes.length;

  // normalize the "types" (they could be strings,
  // so turn into real type instances)
  fixedArgTypes = fixedArgTypes.map(ref.coerceType);

  // get the names of the fixed arg types
  const fixedKey = fixedArgTypes.map(function (type) {
    return getId(type);
  });


  // what gets returned is another function that needs to be invoked with the rest
  // of the variadic types that are being invoked from the function.
  function variadic_function_generator () {
    debug('variadic_function_generator invoked');

    // first get the types of variadic args we are working with
    const argTypes = fixedArgTypes.slice();
    let key = fixedKey.slice();

    for (let i = 0; i < arguments.length; i++) {
      const type = ref.coerceType(arguments[i]);
      argTypes.push(type);

      const ffi_type = Type(type);
      assert(ffi_type.name);
      key.push(getId(type));
    }

    // now figure out the return type
    const rtnType = ref.coerceType(variadic_function_generator.returnType);
    const rtnName = getId(rtnType);
    assert(rtnName);

    // first let's generate the key and see if we got a cache-hit
    key = rtnName + key.join('');

    let func = cache[key];
    if (func) {
      debug('cache hit for key:', key);
    } else {
      // create the `ffi_cif *` instance
      debug('creating the variadic ffi_cif instance for key:', key);
      const cif = CIF_var(returnType, argTypes, numFixedArgs, abi);
      func = cache[key] = _ForeignFunction(cif, funcPtr, rtnType, argTypes);
    }
    return func;
  }

  // set the return type. we set it as a property of the function generator to
  // allow for monkey patching the return value in the very rare case where the
  // return type is variadic as well
  variadic_function_generator.returnType = returnType;

  return variadic_function_generator;
}

module.exports = VariadicForeignFunction;

const idKey = '_ffiId';
let counter = 0;
function getId (type) {
  if (!type.hasOwnProperty(idKey)) {
    type[idKey] = ((counter++*0x10000)|0).toString(16);
  }
  return type[idKey];
}


/***/ }),

/***/ 637:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/**
 * Module dependencies.
 */

const ref = __webpack_require__(859);
const assert = __webpack_require__(357);
const bindings = __webpack_require__(207);
const Callback = __webpack_require__(145);
const ForeignFunction = __webpack_require__(18);
const debug = __webpack_require__(997)('ffi:FunctionType');

/**
 * Module exports.
 */

module.exports = Function;

/**
 * Creates and returns a "type" object for a C "function pointer".
 *
 * @api public
 */

function Function (retType, argTypes, abi) {
  if (!(this instanceof Function)) {
    return new Function(retType, argTypes, abi);
  }

  debug('creating new FunctionType');

  // check args
  assert(!!retType, 'expected a return "type" object as the first argument');
  assert(Array.isArray(argTypes), 'expected Array of arg "type" objects as the second argument');

  // normalize the "types" (they could be strings, so turn into real type
  // instances)
  this.retType = ref.coerceType(retType);
  this.argTypes = argTypes.map(ref.coerceType);
  this.abi = null == abi ? bindings.FFI_DEFAULT_ABI : abi;
}

/**
 * The "ffi_type" is set for node-ffi functions.
 */

Function.prototype.ffi_type = bindings.FFI_TYPES.pointer;

/**
 * The "size" is always pointer-sized.
 */

Function.prototype.size = ref.sizeof.pointer;

/**
 * The "alignment" is always pointer-aligned.
 */

Function.prototype.alignment = ref.alignof.pointer;

/**
 * The "indirection" is always 1 to ensure that our get()/set() get called.
 */

Function.prototype.indirection = 1;

/**
 * Returns a ffi.Callback pointer (Buffer) of this function type for the
 * given `fn` Function.
 */

Function.prototype.toPointer = function toPointer (fn) {
  return Callback(this.retType, this.argTypes, this.abi, fn);
};

/**
 * Returns a ffi.ForeignFunction (Function) of this function type for the
 * given `buf` Buffer.
 */

Function.prototype.toFunction = function toFunction (buf) {
  return ForeignFunction(buf, this.retType, this.argTypes, this.abi);
};

/**
 * get function; return a ForeignFunction instance.
 */

Function.prototype.get = function get (buffer, offset) {
  debug('ffi FunctionType "get" function');
  const ptr = buffer.readPointer(offset);
  return this.toFunction(ptr);
};

/**
 * set function; return a Callback buffer.
 */

Function.prototype.set = function set (buffer, offset, value) {
  debug('ffi FunctionType "set" function');
  let ptr;
  if ('function' == typeof value) {
    ptr = this.toPointer(value);
  } else if (Buffer.isBuffer(value)) {
    ptr = value;
  } else {
    throw new Error('don\'t know how to set callback function for: ' + value);
  }
  buffer.writePointer(ptr, offset);
};


/***/ }),

/***/ 458:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/**
 * Module dependencies.
 */

const DynamicLibrary = __webpack_require__(61);
const ForeignFunction = __webpack_require__(18);
const VariadicForeignFunction = __webpack_require__(887);
const debug = __webpack_require__(997)('ffi:Library');
const RTLD_NOW = DynamicLibrary.FLAGS.RTLD_NOW;

/**
 * The extension to use on libraries.
 * i.e.  libm  ->  libm.so   on linux
 */

const EXT = Library.EXT = {
  'linux':  '.so',
  'linux2': '.so',
  'sunos':  '.so',
  'solaris':'.so',
  'freebsd':'.so',
  'openbsd':'.so',
  'darwin': '.dylib',
  'mac':    '.dylib',
  'win32':  '.dll'
}[process.platform];

/**
 * Provides a friendly abstraction/API on-top of DynamicLibrary and
 * ForeignFunction.
 */

function Library (libfile, funcs, lib) {
  debug('creating Library object for', libfile);

  if (libfile && typeof libfile === 'string' && libfile.indexOf(EXT) === -1) {
    debug('appending library extension to library name', EXT);
    libfile += EXT;
  }

  if (!lib) {
    lib = {};
  }
  let dl;
  if (typeof libfile === 'string' || !libfile) {
    dl = new DynamicLibrary(libfile || null, RTLD_NOW);
  } else {
    dl = libfile;
  }

  Object.keys(funcs || {}).forEach(function (func) {
    debug('defining function', func);

    const fptr = dl.get(func);
    const info = funcs[func];

    if (fptr.isNull()) {
      throw new Error('Library: "' + dl.path()
        + '" returned NULL function pointer for "' + func + '"');
    }

    const resultType = info[0];
    const paramTypes = info[1];
    const fopts = info[2];
    const abi = fopts && fopts.abi;
    const async = fopts && fopts.async;
    const varargs = fopts && fopts.varargs;

    if (varargs) {
      lib[func] = VariadicForeignFunction(fptr, resultType, paramTypes, abi);
    } else {
      const ff = ForeignFunction(fptr, resultType, paramTypes, abi);
      lib[func] = async ? ff.async : ff;
    }
  });

  return lib;
}

module.exports = Library;


/***/ }),

/***/ 979:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/**
 * Module dependencies.
 */

const ref = __webpack_require__(859);
const assert = __webpack_require__(357);
const debug = __webpack_require__(997)('ffi:types');
const Struct = __webpack_require__(835)(ref);
const bindings = __webpack_require__(207);

/**
 * Define the `ffi_type` struct (see deps/libffi/include/ffi.h) for use in JS.
 * This struct type is used internally to define custom struct ret/arg types.
 */

const FFI_TYPE = Type.FFI_TYPE = Struct();
FFI_TYPE.defineProperty('size',      ref.types.size_t);
FFI_TYPE.defineProperty('alignment', ref.types.ushort);
FFI_TYPE.defineProperty('type',      ref.types.ushort);
// this last prop is a C Array of `ffi_type *` elements, so this is `ffi_type **`
const ffi_type_ptr_array = ref.refType(ref.refType(FFI_TYPE));
FFI_TYPE.defineProperty('elements',  ffi_type_ptr_array);
assert.strictEqual(bindings.FFI_TYPE_SIZE, FFI_TYPE.size);

/**
 * Returns a `ffi_type *` Buffer appropriate for the given "type".
 *
 * @param {Type|String} type A "ref" type (or string) to get the `ffi_type` for
 * @return {Buffer} A buffer pointing to a `ffi_type` instance for "type"
 * @api private
 */

function Type (type) {
  type = ref.coerceType(type);
  debug('Type()', type.name || type);
  assert(type.indirection >= 1, 'invalid "type" given: ' + (type.name || type));
  let ret;

  // first we assume it's a regular "type". if the "indirection" is greater than
  // 1, then we can just use "pointer" ffi_type, otherwise we hope "ffi_type" is
  // set
  if (type.indirection === 1) {
    ret = type.ffi_type;
  } else {
    ret = bindings.FFI_TYPES.pointer;
  }

  // if "ret" isn't set (ffi_type was not set) then we check for "ref-array" type
  if (!ret && type.type) {
    // got a "ref-array" type
    // passing arrays to C functions are always by reference, so we use "pointer"
    ret = bindings.FFI_TYPES.pointer;
  }

  if (!ret && type.fields) {
    // got a "ref-struct" type
    // need to create the `ffi_type` instance manually
    debug('creating an `ffi_type` for given "ref-struct" type')
    const fields = type.fields;
    const fieldNames = Object.keys(fields);
    const numFields = fieldNames.length;
    let numElements = 0;
    const ffi_type = new FFI_TYPE;
    let field;
    let ffi_type_ptr;

    // these are the "ffi_type" values expected for a struct
    ffi_type.size = 0;
    ffi_type.alignment = 0;
    ffi_type.type = 13; // FFI_TYPE_STRUCT

    // first we have to figure out the number of "elements" that will go in the
    // array. this would normally just be "numFields" but we also have to account
    // for arrays, which each act as their own element
    for (let i = 0; i < numFields; i++) {
      field = fields[fieldNames[i]];
      if (field.type.fixedLength > 0) {
        // a fixed-length "ref-array" type
        numElements += field.type.fixedLength;
      } else {
        numElements += 1;
      }
    }

    // hand-crafting a null-terminated array here.
    // XXX: use "ref-array"?
    const size = ref.sizeof.pointer * (numElements + 1); // +1 because of the NULL terminator
    const elements = ffi_type.elements = Buffer.alloc(size);
    let index = 0;
    for (let i = 0; i < numFields; i++) {
      field = fields[fieldNames[i]];
      if (field.type.fixedLength > 0) {
        // a fixed-length "ref-array" type
        ffi_type_ptr = Type(field.type.type);
        for (var j = 0; j < field.type.fixedLength; j++) {
          elements.writePointer(ffi_type_ptr, (index++) * ref.sizeof.pointer);
        }
      } else {
        ffi_type_ptr = Type(field.type);
        elements.writePointer(ffi_type_ptr, (index++) * ref.sizeof.pointer);
      }
    }
    // final NULL pointer to terminate the Array
    elements.writePointer(ref.NULL, index * ref.sizeof.pointer);
    // also set the `ffi_type` property to that it's cached for next time
    ret = type.ffi_type = ffi_type.ref();
  }

  if (!ret && type.name) {
    // handle "ref" types other than the set that node-ffi is using (i.e.
    // a separate copy)
    if ('CString' == type.name) {
      ret = type.ffi_type = bindings.FFI_TYPES.pointer;
    } else {
      let cur = type;
      while (!ret && cur) {
        ret = cur.ffi_type = bindings.FFI_TYPES[cur.name];
        cur = Object.getPrototypeOf(cur);
      }
    }
  }

  assert(ret, 'Could not determine the `ffi_type` instance for type: ' + (type.name || type))
  debug('returning `ffi_type`', ret.name)
  return ret;
}

module.exports = Type;


/***/ }),

/***/ 372:
/***/ ((module) => {

"use strict";


module.exports = (flag, argv = process.argv) => {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
};


/***/ }),

/***/ 859:
/***/ ((module, exports, __webpack_require__) => {

"use strict";

const assert = __webpack_require__(357);
const inspect = __webpack_require__(669).inspect;
const debug = __webpack_require__(997)('ref');
const os = __webpack_require__(87);
const path = __webpack_require__(622);

exports = module.exports = require(__webpack_require__.ab + "prebuilds/darwin-x64/node.napi.node");

exports.endianness = os.endianness();

/**
 * A `Buffer` that references the C NULL pointer. That is, its memory address
 * points to 0. Its `length` is 0 because accessing any data from this buffer
 * would cause a _segmentation fault_.
 *
 * ```
 * console.log(ref.NULL);
 * <SlowBuffer@0x0 >
 * ```
 *
 * @name NULL
 * @type Buffer
 */

/**
 * A string that represents the native endianness of the machine's processor.
 * The possible values are either `"LE"` or `"BE"`.
 *
 * ```
 * console.log(ref.endianness);
 * 'LE'
 * ```
 *
 * @name endianness
 * @type String
 */

/**
 * Accepts a `Buffer` instance and returns the memory address of the buffer
 * instance. Returns a JavaScript Number, which can't hold 64-bit integers,
 * so this function is unsafe on 64-bit systems.
 * ```
 * console.log(ref.address(new Buffer(1)));
 * 4320233616
 *
 * console.log(ref.address(ref.NULL)));
 * 0
 * ```
 *
 * @param {Buffer} buffer The buffer to get the memory address of.
 * @return {Number} The memory address the buffer instance.
 * @name address
 * @type method
 */

/**
 * Accepts a `Buffer` instance and returns _true_ if the buffer represents the
 * NULL pointer, _false_ otherwise.
 *
 * ```
 * console.log(ref.isNull(new Buffer(1)));
 * false
 *
 * console.log(ref.isNull(ref.NULL));
 * true
 * ```
 *
 * @param {Buffer} buffer The buffer to check for NULL.
 * @return {Boolean} true or false.
 * @name isNull
 * @type method
 */

/**
 * Reads a JavaScript Object that has previously been written to the given
 * _buffer_ at the given _offset_.
 *
 * ```
 * var obj = { foo: 'bar' };
 * var buf = ref.alloc('Object', obj);
 *
 * var obj2 = ref.readObject(buf, 0);
 * console.log(obj === obj2);
 * true
 * ```
 *
 * @param {Buffer} buffer The buffer to read an Object from.
 * @param {Number} offset The offset to begin reading from.
 * @return {Object} The Object that was read from _buffer_.
 * @name readObject
 * @type method
 */

/**
 * Reads a Buffer instance from the given _buffer_ at the given _offset_.
 * The _size_ parameter specifies the `length` of the returned Buffer instance,
 * which defaults to __0__.
 *
 * ```
 * var buf = new Buffer('hello world');
 * var pointer = ref.alloc('pointer', buf);
 *
 * var buf2 = ref.readPointer(pointer, 0, buf.length);
 * console.log(buf2.toString());
 * 'hello world'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @param {Number} length (optional) The length of the returned Buffer. Defaults to 0.
 * @return {Buffer} The Buffer instance that was read from _buffer_.
 * @name readPointer
 * @type method
 */

/**
 * Returns a JavaScript String read from _buffer_ at the given _offset_. The
 * C String is read until the first NULL byte, which indicates the end of the
 * String.
 *
 * This function can read beyond the `length` of a Buffer.
 *
 * ```
 * var buf = new Buffer('hello\0world\0');
 *
 * var str = ref.readCString(buf, 0);
 * console.log(str);
 * 'hello'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @return {String} The String that was read from _buffer_.
 * @name readCString
 * @type method
 */

/**
 * Returns a big-endian signed 64-bit int read from _buffer_ at the given
 * _offset_.
 *
 * If the returned value will fit inside a JavaScript Number without losing
 * precision, then a Number is returned, otherwise a String is returned.
 *
 * ```
 * var buf = ref.alloc('int64');
 * ref.writeInt64BE(buf, 0, '9223372036854775807');
 *
 * var val = ref.readInt64BE(buf, 0)
 * console.log(val)
 * '9223372036854775807'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @return {Number|String} The Number or String that was read from _buffer_.
 * @name readInt64BE
 * @type method
 */

/**
 * Returns a little-endian signed 64-bit int read from _buffer_ at the given
 * _offset_.
 *
 * If the returned value will fit inside a JavaScript Number without losing
 * precision, then a Number is returned, otherwise a String is returned.
 *
 * ```
 * var buf = ref.alloc('int64');
 * ref.writeInt64LE(buf, 0, '9223372036854775807');
 *
 * var val = ref.readInt64LE(buf, 0)
 * console.log(val)
 * '9223372036854775807'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @return {Number|String} The Number or String that was read from _buffer_.
 * @name readInt64LE
 * @type method
 */

/**
 * Returns a big-endian unsigned 64-bit int read from _buffer_ at the given
 * _offset_.
 *
 * If the returned value will fit inside a JavaScript Number without losing
 * precision, then a Number is returned, otherwise a String is returned.
 *
 * ```
 * var buf = ref.alloc('uint64');
 * ref.writeUInt64BE(buf, 0, '18446744073709551615');
 *
 * var val = ref.readUInt64BE(buf, 0)
 * console.log(val)
 * '18446744073709551615'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @return {Number|String} The Number or String that was read from _buffer_.
 * @name readUInt64BE
 * @type method
 */

/**
 * Returns a little-endian unsigned 64-bit int read from _buffer_ at the given
 * _offset_.
 *
 * If the returned value will fit inside a JavaScript Number without losing
 * precision, then a Number is returned, otherwise a String is returned.
 *
 * ```
 * var buf = ref.alloc('uint64');
 * ref.writeUInt64LE(buf, 0, '18446744073709551615');
 *
 * var val = ref.readUInt64LE(buf, 0)
 * console.log(val)
 * '18446744073709551615'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @return {Number|String} The Number or String that was read from _buffer_.
 * @name readUInt64LE
 * @type method
 */

/**
 * Writes the _input_ Number or String as a big-endian signed 64-bit int into
 * _buffer_ at the given _offset_.
 *
 * ```
 * var buf = ref.alloc('int64');
 * ref.writeInt64BE(buf, 0, '9223372036854775807');
 * ```
 *
 * @param {Buffer} buffer The buffer to write to.
 * @param {Number} offset The offset to begin writing from.
 * @param {Number|String} input This String or Number which gets written.
 * @name writeInt64BE
 * @type method
 */

/**
 * Writes the _input_ Number or String as a little-endian signed 64-bit int into
 * _buffer_ at the given _offset_.
 *
 * ```
 * var buf = ref.alloc('int64');
 * ref.writeInt64LE(buf, 0, '9223372036854775807');
 * ```
 *
 * @param {Buffer} buffer The buffer to write to.
 * @param {Number} offset The offset to begin writing from.
 * @param {Number|String} input This String or Number which gets written.
 * @name writeInt64LE
 * @type method
 */

/**
 * Writes the _input_ Number or String as a big-endian unsigned 64-bit int into
 * _buffer_ at the given _offset_.
 *
 * ```
 * var buf = ref.alloc('uint64');
 * ref.writeUInt64BE(buf, 0, '18446744073709551615');
 * ```
 *
 * @param {Buffer} buffer The buffer to write to.
 * @param {Number} offset The offset to begin writing from.
 * @param {Number|String} input This String or Number which gets written.
 * @name writeUInt64BE
 * @type method
 */

/**
 * Writes the _input_ Number or String as a little-endian unsigned 64-bit int
 * into _buffer_ at the given _offset_.
 *
 * ```
 * var buf = ref.alloc('uint64');
 * ref.writeUInt64LE(buf, 0, '18446744073709551615');
 * ```
 *
 * @param {Buffer} buffer The buffer to write to.
 * @param {Number} offset The offset to begin writing from.
 * @param {Number|String} input This String or Number which gets written.
 * @name writeUInt64LE
 * @type method
 */

/**
 * Returns a new clone of the given "type" object, with its
 * `indirection` level incremented by **1**.
 *
 * Say you wanted to create a type representing a `void *`:
 *
 * ```
 * var voidPtrType = ref.refType(ref.types.void);
 * ```
 *
 * @param {Object|String} type The "type" object to create a reference type from. Strings get coerced first.
 * @return {Object} The new "type" object with its `indirection` incremented by 1.
 */

exports.refType = function refType (type) {
  const _type = exports.coerceType(type);
  const rtn = Object.create(_type);
  rtn.indirection++;
  if (_type.name) {
    Object.defineProperty(rtn, 'name', {
      value: _type.name + '*',
      configurable: true,
      enumerable: true,
      writable: true
    });
  }
  return rtn;
}

/**
 * Returns a new clone of the given "type" object, with its
 * `indirection` level decremented by 1.
 *
 * @param {Object|String} type The "type" object to create a dereference type from. Strings get coerced first.
 * @return {Object} The new "type" object with its `indirection` decremented by 1.
 */

exports.derefType = function derefType (type) {
  const _type = exports.coerceType(type);
  if (_type.indirection === 1) {
    throw new Error('Cannot create deref\'d type for type with indirection 1');
  }
  let rtn = Object.getPrototypeOf(_type);
  if (rtn.indirection !== _type.indirection - 1) {
    // slow case
    rtn = Object.create(_type);
    rtn.indirection--;
  }
  return rtn;
}

/**
 * Coerces a "type" object from a String or an actual "type" object. String values
 * are looked up from the `ref.types` Object. So:
 *
 *   * `"int"` gets coerced into `ref.types.int`.
 *   * `"int *"` gets translated into `ref.refType(ref.types.int)`
 *   * `ref.types.int` gets translated into `ref.types.int` (returns itself)
 *
 * Throws an Error if no valid "type" object could be determined. Most `ref`
 * functions use this function under the hood, so anywhere a "type" object is
 * expected, a String may be passed as well, including simply setting the
 * `buffer.type` property.
 *
 * ```
 * var type = ref.coerceType('int **');
 *
 * console.log(type.indirection);
 * 3
 * ```
 *
 * @param {Object|String} type The "type" Object or String to coerce.
 * @return {Object} A "type" object
 */

exports.coerceType = function coerceType (type) {
  let rtn = type;
  if (typeof rtn === 'string') {
    rtn = exports.types[type];
    if (rtn) return rtn;

    // strip whitespace
    rtn = type.replace(/\s+/g, '').toLowerCase();
    if (rtn === 'pointer') {
      // legacy "pointer" being used :(
      rtn = exports.refType(exports.types.void); // void *
    } else if (rtn === 'string') {
      rtn = exports.types.CString; // special char * type
    } else {
      var refCount = 0;
      rtn = rtn.replace(/\*/g, function() {
        refCount++;
        return '';
      });
      // allow string names to be passed in
      rtn = exports.types[rtn];
      if (refCount > 0) {
        if (!(rtn && 'size' in rtn && 'indirection' in rtn)) {
          throw new TypeError('could not determine a proper "type" from: ' + inspect(type));
        }
        for (let i = 0; i < refCount; i++) {
          rtn = exports.refType(rtn);
        }
      }
    }
  }
  if (!(rtn && 'size' in rtn && 'indirection' in rtn)) {
    throw new TypeError('could not determine a proper "type" from: ' + inspect(type));
  }
  return rtn;
}

/**
 * Returns the "type" property of the given Buffer.
 * Creates a default type for the buffer when none exists.
 *
 * @param {Buffer} buffer The Buffer instance to get the "type" object from.
 * @return {Object} The "type" object from the given Buffer.
 */

exports.getType = function getType (buffer) {
  if (!buffer.type) {
    debug('WARN: no "type" found on buffer, setting default "type"', buffer);
    buffer.type = {};
    buffer.type.size = buffer.length;
    buffer.type.indirection = 1;
    buffer.type.get = function get () {
      throw new Error('unknown "type"; cannot get()');
    };
    buffer.type.set = function set () {
      throw new Error('unknown "type"; cannot set()');
    };
  }
  return exports.coerceType(buffer.type);
}

/**
 * Calls the `get()` function of the Buffer's current "type" (or the
 * passed in _type_ if present) at the given _offset_.
 *
 * This function handles checking the "indirection" level and returning a
 * proper "dereferenced" Bufffer instance when necessary.
 *
 * @param {Buffer} buffer The Buffer instance to read from.
 * @param {Number} offset (optional) The offset on the Buffer to start reading from. Defaults to 0.
 * @param {Object|String} type (optional) The "type" object to use when reading. Defaults to calling `getType()` on the buffer.
 * @return {?} Whatever value the "type" used when reading returns.
 */

exports.get = function get (buffer, offset, type) {
  if (!offset) {
    offset = 0;
  }
  if (type) {
    type = exports.coerceType(type);
  } else {
    type = exports.getType(buffer);
  }
  debug('get(): (offset: %d)', offset, buffer);
  assert(type.indirection > 0, `"indirection" level must be at least 1, saw ${type.indirection}`);
  if (type.indirection === 1) {
    // need to check "type"
    return type.get(buffer, offset);
  } else {
    // need to create a deref'd Buffer
    const size = type.indirection === 2 ? type.size : exports.sizeof.pointer;
    const reference = exports.readPointer(buffer, offset, size);
    reference.type = exports.derefType(type);
    return reference;
  }
}

/**
 * Calls the `set()` function of the Buffer's current "type" (or the
 * passed in _type_ if present) at the given _offset_.
 *
 * This function handles checking the "indirection" level writing a pointer rather
 * than calling the `set()` function if the indirection is greater than 1.
 *
 * @param {Buffer} buffer The Buffer instance to write to.
 * @param {Number} offset The offset on the Buffer to start writing to.
 * @param {?} value The value to write to the Buffer instance.
 * @param {Object|String} type (optional) The "type" object to use when reading. Defaults to calling `getType()` on the buffer.
 */

exports.set = function set (buffer, offset, value, type) {
  if (!offset) {
    offset = 0;
  }
  if (type) {
    type = exports.coerceType(type);
  } else {
    type = exports.getType(buffer);
  }
  debug('set(): (offset: %d)', offset, buffer, value);
  assert(type.indirection >= 1, '"indirection" level must be at least 1');
  if (type.indirection === 1) {
    type.set(buffer, offset, value);
  } else {
    exports.writePointer(buffer, offset, value);
  }
}


/**
 * Returns a new Buffer instance big enough to hold `type`,
 * with the given `value` written to it.
 *
 * ``` js
 * var intBuf = ref.alloc(ref.types.int)
 * var int_with_4 = ref.alloc(ref.types.int, 4)
 * ```
 *
 * @param {Object|String} type The "type" object to allocate. Strings get coerced first.
 * @param {?} value (optional) The initial value set on the returned Buffer, using _type_'s `set()` function.
 * @return {Buffer} A new Buffer instance with it's `type` set to "type", and (optionally) "value" written to it.
 */

exports.alloc = function alloc (_type, value) {
  var type = exports.coerceType(_type);
  debug('allocating Buffer for type with "size"', type.size);
  let size;
  if (type.indirection === 1) {
    size = type.size;
  } else {
    size = exports.sizeof.pointer;
  }
  const buffer = Buffer.alloc(size);
  buffer.type = type;
  if (arguments.length >= 2) {
    debug('setting value on allocated buffer', value);
    exports.set(buffer, 0, value, type);
  }
  return buffer;
}

/**
 * Returns a new `Buffer` instance with the given String written to it with the
 * given encoding (defaults to __'utf8'__). The buffer is 1 byte longer than the
 * string itself, and is NUL terminated.
 *
 * ```
 * var buf = ref.allocCString('hello world');
 *
 * console.log(buf.toString());
 * 'hello world\u0000'
 * ```
 *
 * @param {String} string The JavaScript string to be converted to a C string.
 * @param {String} encoding (optional) The encoding to use for the C string. Defaults to __'utf8'__.
 * @return {Buffer} The new `Buffer` instance with the specified String wrtten to it, and a trailing NUL byte.
 */

exports.allocCString = function allocCString (string, encoding) {
  if (null == string || (Buffer.isBuffer(string) && exports.isNull(string))) {
    return exports.NULL;
  }
  const size = Buffer.byteLength(string, encoding) + 1;
  const buffer = Buffer.allocUnsafe(size);
  exports.writeCString(buffer, 0, string, encoding);
  buffer.type = charPtrType;
  return buffer;
}

/**
 * Writes the given string as a C String (NULL terminated) to the given buffer
 * at the given offset. "encoding" is optional and defaults to __'utf8'__.
 *
 * Unlike `readCString()`, this function requires the buffer to actually have the
 * proper length.
 *
 * @param {Buffer} buffer The Buffer instance to write to.
 * @param {Number} offset The offset of the buffer to begin writing at.
 * @param {String} string The JavaScript String to write that will be written to the buffer.
 * @param {String} encoding (optional) The encoding to read the C string as. Defaults to __'utf8'__.
 */

exports.writeCString = function writeCString (buffer, offset, string, encoding) {
  assert(Buffer.isBuffer(buffer), 'expected a Buffer as the first argument');
  assert.strictEqual('string', typeof string, 'expected a "string" as the third argument');
  if (!offset) {
    offset = 0;
  }
  if (!encoding) {
    encoding = 'utf8';
  }
  const size = buffer.length - offset - 1;
  const len = buffer.write(string, offset, size, encoding);
  buffer.writeUInt8(0, offset + len);  // NUL terminate
}

exports['readInt64' + exports.endianness] = exports.readInt64;
exports['readUInt64' + exports.endianness] = exports.readUInt64;
exports['writeInt64' + exports.endianness] = exports.writeInt64;
exports['writeUInt64' + exports.endianness] = exports.writeUInt64;

var opposite = exports.endianness == 'LE' ? 'BE' : 'LE';
var int64temp =  Buffer.alloc(exports.sizeof.int64);
var uint64temp = Buffer.alloc(exports.sizeof.uint64);

exports['readInt64' + opposite] = function (buffer, offset) {
  for (let i = 0; i < exports.sizeof.int64; i++) {
    int64temp[i] = buffer[offset + exports.sizeof.int64 - i - 1];
  }
  return exports.readInt64(int64temp, 0);
}
exports['readUInt64' + opposite] = function (buffer, offset) {
  for (let i = 0; i < exports.sizeof.uint64; i++) {
    uint64temp[i] = buffer[offset + exports.sizeof.uint64 - i - 1];
  }
  return exports.readUInt64(uint64temp, 0);
}
exports['writeInt64' + opposite] = function (buffer, offset, value) {
  exports.writeInt64(int64temp, 0, value);
  for (let i = 0; i < exports.sizeof.int64; i++) {
    buffer[offset + i] = int64temp[exports.sizeof.int64 - i - 1];
  }
}
exports['writeUInt64' + opposite] = function (buffer, offset, value) {
  exports.writeUInt64(uint64temp, 0, value);
  for (let i = 0; i < exports.sizeof.uint64; i++) {
    buffer[offset + i] = uint64temp[exports.sizeof.uint64 - i - 1];
  }
}

/**
 * `ref()` accepts a Buffer instance and returns a new Buffer
 * instance that is "pointer" sized and has its data pointing to the given
 * Buffer instance. Essentially the created Buffer is a "reference" to the
 * original pointer, equivalent to the following C code:
 *
 * ``` c
 * char *buf = buffer;
 * char **ref = &buf;
 * ```
 *
 * @param {Buffer} buffer A Buffer instance to create a reference to.
 * @return {Buffer} A new Buffer instance pointing to _buffer_.
 */

exports.ref = function ref (buffer) {
  debug('creating a reference to buffer', buffer);
  var type = exports.refType(exports.getType(buffer));
  return exports.alloc(type, buffer);
}

/**
 * Accepts a Buffer instance and attempts to "dereference" it.
 * That is, first it checks the `indirection` count of _buffer_'s "type", and if
 * it's greater than __1__ then it merely returns another Buffer, but with one
 * level less `indirection`.
 *
 * When _buffer_'s indirection is at __1__, then it checks for `buffer.type`
 * which should be an Object with its own `get()` function.
 *
 * ```
 * var buf = ref.alloc('int', 6);
 *
 * var val = ref.deref(buf);
 * console.log(val);
 * 6
 * ```
 *
 *
 * @param {Buffer} buffer A Buffer instance to dereference.
 * @return {?} The returned value after dereferencing _buffer_.
 */

exports.deref = function deref (buffer) {
  debug('dereferencing buffer', buffer);
  return exports.get(buffer);
}

const kAttachedRefs = Symbol('attached');

/**
 * Attaches _object_ to _buffer_ such that it prevents _object_ from being garbage
 * collected until _buffer_ does.
 *
 * @param {Buffer} buffer A Buffer instance to attach _object_ to.
 * @param {Object|Buffer} object An Object or Buffer to prevent from being garbage collected until _buffer_ does.
 * @api private
 */

exports._attach = function _attach (buf, obj) {
  if (!buf[kAttachedRefs]) {
    buf[kAttachedRefs] = [];
  }
  buf[kAttachedRefs].push(obj);
}

/**
 * @param {Buffer} buffer
 * @param {Number} offset
 * @param {Object} object
 * @name _writeObject
 * @api private
 */

/**
 * Writes a pointer to _object_ into _buffer_ at the specified _offset.
 *
 * This function "attaches" _object_ to _buffer_ to prevent it from being garbage
 * collected.
 *
 * ```
 * var buf = ref.alloc('Object');
 * ref.writeObject(buf, 0, { foo: 'bar' });
 *
 * ```
 *
 * @param {Buffer} buffer A Buffer instance to write _object_ to.
 * @param {Number} offset The offset on the Buffer to start writing at.
 * @param {Object} object The Object to be written into _buffer_.
 */

exports.writeObject = function writeObject (buf, offset, obj) {
  debug('writing Object to buffer', buf, offset, obj);
  exports._writeObject(buf, offset, obj);
  exports._attach(buf, obj);
}


/**
 * Same as `ref.writePointer()`, except that this version does not attach
 * _pointer_ to _buffer_, which is potentially unsafe if the garbage collector
 * runs.
 *
 * @param {Buffer} buffer A Buffer instance to write _pointer to.
 * @param {Number} offset The offset on the Buffer to start writing at.
 * @param {Buffer} pointer The Buffer instance whose memory address will be written to _buffer_.
 * @name _writePointer
 * @api private
 */

/**
 * Writes the memory address of _pointer_ to _buffer_ at the specified _offset_.
 *
 * This function "attaches" _object_ to _buffer_ to prevent it from being garbage
 * collected.
 *
 * ```
 * var someBuffer = new Buffer('whatever');
 * var buf = ref.alloc('pointer');
 * ref.writePointer(buf, 0, someBuffer);
 * ```
 *
 * @param {Buffer} buffer A Buffer instance to write _pointer to.
 * @param {Number} offset The offset on the Buffer to start writing at.
 * @param {Buffer} pointer The Buffer instance whose memory address will be written to _buffer_.
 */

exports.writePointer = function writePointer (buf, offset, ptr) {
  debug('writing pointer to buffer', buf, offset, ptr);
  // Passing true as a fourth parameter does an a stronger
  // version of attach which ensures ptr is only collected after
  // the finalizer for buf has run. See
  // https://github.com/node-ffi-napi/ref-napi/issues/54
  // for why this is necessary
  exports._writePointer(buf, offset, ptr, true);
};

/**
 * Same as `ref.reinterpret()`, except that this version does not attach
 * _buffer_ to the returned Buffer, which is potentially unsafe if the
 * garbage collector runs.
 *
 * @param {Buffer} buffer A Buffer instance to base the returned Buffer off of.
 * @param {Number} size The `length` property of the returned Buffer.
 * @param {Number} offset The offset of the Buffer to begin from.
 * @return {Buffer} A new Buffer instance with the same memory address as _buffer_, and the requested _size_.
 * @name _reinterpret
 * @api private
 */

/**
 * Returns a new Buffer instance with the specified _size_, with the same memory
 * address as _buffer_.
 *
 * This function "attaches" _buffer_ to the returned Buffer to prevent it from
 * being garbage collected.
 *
 * @param {Buffer} buffer A Buffer instance to base the returned Buffer off of.
 * @param {Number} size The `length` property of the returned Buffer.
 * @param {Number} offset The offset of the Buffer to begin from.
 * @return {Buffer} A new Buffer instance with the same memory address as _buffer_, and the requested _size_.
 */

exports.reinterpret = function reinterpret (buffer, size, offset) {
  debug('reinterpreting buffer to "%d" bytes', size);
  const rtn = exports._reinterpret(buffer, size, offset || 0);
  exports._attach(rtn, buffer);
  return rtn;
}

/**
 * Same as `ref.reinterpretUntilZeros()`, except that this version does not
 * attach _buffer_ to the returned Buffer, which is potentially unsafe if the
 * garbage collector runs.
 *
 * @param {Buffer} buffer A Buffer instance to base the returned Buffer off of.
 * @param {Number} size The number of sequential, aligned `NULL` bytes that are required to terminate the buffer.
 * @param {Number} offset The offset of the Buffer to begin from.
 * @return {Buffer} A new Buffer instance with the same memory address as _buffer_, and a variable `length` that is terminated by _size_ NUL bytes.
 * @name _reinterpretUntilZeros
 * @api private
 */

/**
 * Accepts a `Buffer` instance and a number of `NULL` bytes to read from the
 * pointer. This function will scan past the boundary of the Buffer's `length`
 * until it finds `size` number of aligned `NULL` bytes.
 *
 * This is useful for finding the end of NUL-termintated array or C string. For
 * example, the `readCString()` function _could_ be implemented like:
 *
 * ```
 * function readCString (buf) {
 *   return ref.reinterpretUntilZeros(buf, 1).toString('utf8')
 * }
 * ```
 *
 * This function "attaches" _buffer_ to the returned Buffer to prevent it from
 * being garbage collected.
 *
 * @param {Buffer} buffer A Buffer instance to base the returned Buffer off of.
 * @param {Number} size The number of sequential, aligned `NULL` bytes are required to terminate the buffer.
 * @param {Number} offset The offset of the Buffer to begin from.
 * @return {Buffer} A new Buffer instance with the same memory address as _buffer_, and a variable `length` that is terminated by _size_ NUL bytes.
 */

exports.reinterpretUntilZeros = function reinterpretUntilZeros (buffer, size, offset) {
  debug('reinterpreting buffer to until "%d" NULL (0) bytes are found', size);
  var rtn = exports._reinterpretUntilZeros(buffer, size, offset || 0);
  exports._attach(rtn, buffer);
  return rtn;
};


// the built-in "types"
const types = exports.types = {};

/**
 * The `void` type.
 *
 * @section types
 */

types.void = {
  size: 0,
  indirection: 1,
  get: function get (buf, offset) {
    debug('getting `void` type (returns `null`)');
    return null;
  },
  set: function set (buf, offset, val) {
    debug('setting `void` type (no-op)');
  }
};

/**
 * The `int8` type.
 */

types.int8 = {
  size: exports.sizeof.int8,
  indirection: 1,
  get: function get (buf, offset) {
    return buf.readInt8(offset || 0);
  },
  set: function set (buf, offset, val) {
    if (typeof val === 'string') {
      val = val.charCodeAt(0);
    }
    return buf.writeInt8(val, offset || 0);
  }
};

/**
 * The `uint8` type.
 */

types.uint8 = {
  size: exports.sizeof.uint8,
  indirection: 1,
  get: function get (buf, offset) {
    return buf.readUInt8(offset || 0);
  },
  set: function set (buf, offset, val) {
    if (typeof val === 'string') {
      val = val.charCodeAt(0);
    }
    return buf.writeUInt8(val, offset || 0);
  }
};

/**
 * The `int16` type.
 */

types.int16 = {
  size: exports.sizeof.int16,
  indirection: 1,
  get: function get (buf, offset) {
    return buf['readInt16' + exports.endianness](offset || 0);
  },
  set: function set (buf, offset, val) {
    return buf['writeInt16' + exports.endianness](val, offset || 0);
  }
}

/**
 * The `uint16` type.
 */

types.uint16 = {
  size: exports.sizeof.uint16,
  indirection: 1,
  get: function get (buf, offset) {
    return buf['readUInt16' + exports.endianness](offset || 0);
  },
  set: function set (buf, offset, val) {
    return buf['writeUInt16' + exports.endianness](val, offset || 0);
  }
}

/**
 * The `int32` type.
 */

types.int32 = {
  size: exports.sizeof.int32,
  indirection: 1,
  get: function get (buf, offset) {
    return buf['readInt32' + exports.endianness](offset || 0);
  },
  set: function set (buf, offset, val) {
    return buf['writeInt32' + exports.endianness](val, offset || 0);
  }
}

/**
 * The `uint32` type.
 */

types.uint32 = {
  size: exports.sizeof.uint32,
  indirection: 1,
  get: function get (buf, offset) {
    return buf['readUInt32' + exports.endianness](offset || 0);
  },
  set: function set (buf, offset, val) {
    return buf['writeUInt32' + exports.endianness](val, offset || 0);
  }
}

/**
 * The `int64` type.
 */

types.int64 = {
  size: exports.sizeof.int64,
  indirection: 1,
  get: function get (buf, offset) {
    return buf['readInt64' + exports.endianness](offset || 0);
  },
  set: function set (buf, offset, val) {
    return buf['writeInt64' + exports.endianness](val, offset || 0);
  }
}

/**
 * The `uint64` type.
 */

types.uint64 = {
  size: exports.sizeof.uint64,
  indirection: 1,
  get: function get (buf, offset) {
    return buf['readUInt64' + exports.endianness](offset || 0);
  },
  set: function set (buf, offset, val) {
    return buf['writeUInt64' + exports.endianness](val, offset || 0);
  }
}

/**
 * The `float` type.
 */

types.float = {
  size: exports.sizeof.float,
  indirection: 1,
  get: function get (buf, offset) {
    return buf['readFloat' + exports.endianness](offset || 0);
  },
  set: function set (buf, offset, val) {
    return buf['writeFloat' + exports.endianness](val, offset || 0);
  }
}

/**
 * The `double` type.
 */

types.double = {
  size: exports.sizeof.double,
  indirection: 1,
  get: function get (buf, offset) {
    return buf['readDouble' + exports.endianness](offset || 0)
  },
  set: function set (buf, offset, val) {
    return buf['writeDouble' + exports.endianness](val, offset || 0)
  }
}

/**
 * The `Object` type. This can be used to read/write regular JS Objects
 * into raw memory.
 */

types.Object = {
  size: exports.sizeof.Object,
  indirection: 1,
  get: function get (buf, offset) {
    return buf.readObject(offset || 0);
  },
  set: function set (buf, offset, val) {
    return buf.writeObject(val, offset || 0);
  }
}

/**
 * The `CString` (a.k.a `"string"`) type.
 *
 * CStrings are a kind of weird thing. We say it's `sizeof(char *)`, and
 * `indirection` level of 1, which means that we have to return a Buffer that
 * is pointer sized, and points to a some utf8 string data, so we have to create
 * a 2nd "in-between" buffer.
 */

types.CString = {
  size: exports.sizeof.pointer,
  alignment: exports.alignof.pointer,
  indirection: 1,
  get: function get (buf, offset) {
    const _buf = exports.readPointer(buf, offset)
    if (exports.isNull(_buf)) {
      return null;
    }
    return exports.readCString(_buf, 0);
  },
  set: function set (buf, offset, val) {
    let _buf
    if (Buffer.isBuffer(val)) {
      _buf = val;
    } else {
      // assume string
      _buf = exports.allocCString(val);
    }
    return exports.writePointer(buf, offset, _buf);
  }
}

// alias Utf8String
var utfstringwarned = false;
Object.defineProperty(types, 'Utf8String', {
  enumerable: false,
  configurable: true,
  get: function() {
    if (!utfstringwarned) {
      utfstringwarned = true;
      console.error('"Utf8String" type is deprecated, use "CString" instead');
    }
    return types.CString;
  }
});

/**
 * The `bool` type.
 *
 * Wrapper type around `types.uint8` that accepts/returns `true` or
 * `false` Boolean JavaScript values.
 *
 * @name bool
 *
 */

/**
 * The `byte` type.
 *
 * @name byte
 */

/**
 * The `char` type.
 *
 * @name char
 */

/**
 * The `uchar` type.
 *
 * @name uchar
 */

/**
 * The `short` type.
 *
 * @name short
 */

/**
 * The `ushort` type.
 *
 * @name ushort
 */

/**
 * The `int` type.
 *
 * @name int
 */

/**
 * The `uint` type.
 *
 * @name uint
 */

/**
 * The `long` type.
 *
 * @name long
 */

/**
 * The `ulong` type.
 *
 * @name ulong
 */

/**
 * The `longlong` type.
 *
 * @name longlong
 */

/**
 * The `ulonglong` type.
 *
 * @name ulonglong
 */

/**
 * The `size_t` type.
 *
 * @name size_t
 */

// "typedef"s for the variable-sized types
[ 'bool', 'byte', 'char', 'uchar', 'short', 'ushort', 'int', 'uint', 'long',
  'ulong', 'longlong', 'ulonglong', 'size_t' ].forEach(name => {
  const unsigned = name === 'bool'
                || name === 'byte'
                || name === 'size_t'
                || name[0] === 'u';
  const size = exports.sizeof[name];
  assert(size >= 1 && size <= 8);
  let typeName = 'int' + (size * 8);
  if (unsigned) {
    typeName = 'u' + typeName;
  }
  const type = exports.types[typeName];
  assert(type);
  exports.types[name] = Object.create(type);
});

// set the "alignment" property on the built-in types
Object.keys(exports.alignof).forEach((name) => {
  if (name === 'pointer')
    return;
  exports.types[name].alignment = exports.alignof[name];
  assert(exports.types[name].alignment > 0);
});

// make the `bool` type work with JS true/false values
exports.types.bool.get = (function (_get) {
  return function get (buf, offset) {
    return _get(buf, offset) ? true : false;
  }
})(exports.types.bool.get);
exports.types.bool.set = (function (_set) {
  return function set (buf, offset, val) {
    if (typeof val !== 'number') {
      val = val ? 1 : 0;
    }
    return _set(buf, offset, val);
  }
})(exports.types.bool.set);

/*!
 * Set the `name` property of the types. Used for debugging...
 */

Object.keys(exports.types).forEach((name) => {
  exports.types[name].name = name;
});

/*!
 * This `char *` type is used by "allocCString()" above.
 */

const charPtrType = exports.refType(exports.types.char);

/*!
 * Set the `type` property of the `NULL` pointer Buffer object.
 */

exports.NULL.type = exports.types.void;

/**
 * `NULL_POINTER` is a pointer-sized `Buffer` instance pointing to `NULL`.
 * Conceptually, it's equivalent to the following C code:
 *
 * ``` c
 * char *null_pointer;
 * null_pointer = NULL;
 * ```
 *
 * @type Buffer
 */

exports.NULL_POINTER = exports.ref(exports.NULL);

/**
 * All these '...' comment blocks below are for the documentation generator.
 *
 * @section buffer
 */

Buffer.prototype.address = function address () {
  return exports.address(this, 0);
};

/**
 * ...
 */

Buffer.prototype.hexAddress = function hexAddress () {
  return exports.hexAddress(this, 0);
};

/**
 * ...
 */

Buffer.prototype.isNull = function isNull () {
  return exports.isNull(this, 0);
};

/**
 * ...
 */

Buffer.prototype.ref = function ref () {
  return exports.ref(this);
};

/**
 * ...
 */

Buffer.prototype.deref = function deref () {
  return exports.deref(this);
};

/**
 * ...
 */

Buffer.prototype.readObject = function readObject (offset) {
  return exports.readObject(this, offset);
};

/**
 * ...
 */

Buffer.prototype.writeObject = function writeObject (obj, offset) {
  return exports.writeObject(this, offset, obj);
};

/**
 * ...
 */

Buffer.prototype.readPointer = function readPointer (offset, size) {
  return exports.readPointer(this, offset, size);
};

/**
 * ...
 */

Buffer.prototype.writePointer = function writePointer (ptr, offset) {
  return exports.writePointer(this, offset, ptr);
};

/**
 * ...
 */

Buffer.prototype.readCString = function readCString (offset) {
  return exports.readCString(this, offset);
};

/**
 * ...
 */

Buffer.prototype.writeCString = function writeCString (string, offset, encoding) {
  return exports.writeCString(this, offset, string, encoding);
};

/**
 * ...
 */

Buffer.prototype.readInt64BE = function readInt64BE (offset) {
  return exports.readInt64BE(this, offset);
};

/**
 * ...
 */

Buffer.prototype.writeInt64BE = function writeInt64BE (val, offset) {
  return exports.writeInt64BE(this, offset, val);
};

/**
 * ...
 */

Buffer.prototype.readUInt64BE = function readUInt64BE (offset) {
  return exports.readUInt64BE(this, offset);
};

/**
 * ...
 */

Buffer.prototype.writeUInt64BE = function writeUInt64BE (val, offset) {
  return exports.writeUInt64BE(this, offset, val);
};

/**
 * ...
 */

Buffer.prototype.readInt64LE = function readInt64LE (offset) {
  return exports.readInt64LE(this, offset);
};

/**
 * ...
 */

Buffer.prototype.writeInt64LE = function writeInt64LE (val, offset) {
  return exports.writeInt64LE(this, offset, val);
};

/**
 * ...
 */

Buffer.prototype.readUInt64LE = function readUInt64LE (offset) {
  return exports.readUInt64LE(this, offset);
};

/**
 * ...
 */

Buffer.prototype.writeUInt64LE = function writeUInt64LE (val, offset) {
  return exports.writeUInt64LE(this, offset, val);
};

/**
 * ...
 */

Buffer.prototype.reinterpret = function reinterpret (size, offset) {
  return exports.reinterpret(this, size, offset);
};

/**
 * ...
 */

Buffer.prototype.reinterpretUntilZeros = function reinterpretUntilZeros (size, offset) {
  return exports.reinterpretUntilZeros(this, size, offset);
};

/**
 * `ref` overwrites the default `Buffer#inspect()` function to include the
 * hex-encoded memory address of the Buffer instance when invoked.
 *
 * This is simply a nice-to-have.
 *
 * **Before**:
 *
 * ``` js
 * console.log(new Buffer('ref'));
 * <Buffer 72 65 66>
 * ```
 *
 * **After**:
 *
 * ``` js
 * console.log(new Buffer('ref'));
 * <Buffer@0x103015490 72 65 66>
 * ```
 */

var inspectSym = inspect.custom || 'inspect';
/**
 * in node 6.91, inspect.custom does not give a correct value; so in this case, don't torch the whole process.
 * fixed in >6.9.2
 */
if (Buffer.prototype[inspectSym]) {
  Buffer.prototype[inspectSym] = overwriteInspect(Buffer.prototype[inspectSym]);
}


// does SlowBuffer inherit from Buffer? (node >= v0.7.9)
if (!(exports.NULL instanceof Buffer)) {
  debug('extending SlowBuffer\'s prototype since it doesn\'t inherit from Buffer.prototype');

  /*!
   * SlowBuffer convenience methods.
   */

  var SlowBuffer = __webpack_require__(293).SlowBuffer;

  SlowBuffer.prototype.address = Buffer.prototype.address;
  SlowBuffer.prototype.hexAddress = Buffer.prototype.hexAddress;
  SlowBuffer.prototype.isNull = Buffer.prototype.isNull;
  SlowBuffer.prototype.ref = Buffer.prototype.ref;
  SlowBuffer.prototype.deref = Buffer.prototype.deref;
  SlowBuffer.prototype.readObject = Buffer.prototype.readObject;
  SlowBuffer.prototype.writeObject = Buffer.prototype.writeObject;
  SlowBuffer.prototype.readPointer = Buffer.prototype.readPointer;
  SlowBuffer.prototype.writePointer = Buffer.prototype.writePointer;
  SlowBuffer.prototype.readCString = Buffer.prototype.readCString;
  SlowBuffer.prototype.writeCString = Buffer.prototype.writeCString;
  SlowBuffer.prototype.reinterpret = Buffer.prototype.reinterpret;
  SlowBuffer.prototype.reinterpretUntilZeros = Buffer.prototype.reinterpretUntilZeros;
  SlowBuffer.prototype.readInt64BE = Buffer.prototype.readInt64BE;
  SlowBuffer.prototype.writeInt64BE = Buffer.prototype.writeInt64BE;
  SlowBuffer.prototype.readUInt64BE = Buffer.prototype.readUInt64BE;
  SlowBuffer.prototype.writeUInt64BE = Buffer.prototype.writeUInt64BE;
  SlowBuffer.prototype.readInt64LE = Buffer.prototype.readInt64LE;
  SlowBuffer.prototype.writeInt64LE = Buffer.prototype.writeInt64LE;
  SlowBuffer.prototype.readUInt64LE = Buffer.prototype.readUInt64LE;
  SlowBuffer.prototype.writeUInt64LE = Buffer.prototype.writeUInt64LE;
/**
 * in node 6.9.1, inspect.custom does not give a correct value; so in this case, don't torch the whole process.
 * fixed in >6.9.2
 */
  if (SlowBuffer.prototype[inspectSym]){
    SlowBuffer.prototype[inspectSym] = overwriteInspect(SlowBuffer.prototype[inspectSym]);
  }
}

function overwriteInspect (inspect) {
  if (inspect.name === 'refinspect') {
    return inspect;
  } else {
    return function refinspect () {
      var v = inspect.apply(this, arguments);
      return v.replace('Buffer', 'Buffer@0x' + this.hexAddress());
    }
  }
}


/***/ }),

/***/ 835:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/**
 * An interface for modeling and instantiating C-style data structures. This is
 * not a constructor per-say, but a constructor generator. It takes an array of
 * tuples, the left side being the type, and the right side being a field name.
 * The order should be the same order it would appear in the C-style struct
 * definition. It returns a function that can be used to construct an object that
 * reads and writes to the data structure using properties specified by the
 * initial field list.
 *
 * The only verboten field names are "ref", which is used used on struct
 * instances as a function to retrieve the backing Buffer instance of the
 * struct, and "ref.buffer" which contains the backing Buffer instance.
 *
 *
 * Example:
 *
 * ``` javascript
 * var ref = require('ref')
 * var Struct = require('ref-struct')
 *
 * // create the `char *` type
 * var charPtr = ref.refType(ref.types.char)
 * var int = ref.types.int
 *
 * // create the struct "type" / constructor
 * var PasswordEntry = Struct({
 *     'username': 'string'
 *   , 'password': 'string'
 *   , 'salt':     int
 * })
 *
 * // create an instance of the struct, backed a Buffer instance
 * var pwd = new PasswordEntry()
 * pwd.username = 'ricky'
 * pwd.password = 'rbransonlovesnode.js'
 * pwd.salt = (Math.random() * 1000000) | 0
 *
 * pwd.username // → 'ricky'
 * pwd.password // → 'rbransonlovesnode.js'
 * pwd.salt     // → 820088
 * ```
 */

/**
 * Module dependencies.
 */

var util = __webpack_require__(669)
var assert = __webpack_require__(357)
var debug = __webpack_require__(727)('ref:struct')

/**
 * Module exports.
 */

module.exports = function (ref) {

/**
 * The Struct "type" meta-constructor.
 */

function Struct () {
  debug('defining new struct "type"')

  /**
   * This is the "constructor" of the Struct type that gets returned.
   *
   * Invoke it with `new` to create a new Buffer instance backing the struct.
   * Pass it an existing Buffer instance to use that as the backing buffer.
   * Pass in an Object containing the struct fields to auto-populate the
   * struct with the data.
   */

  function StructType (arg, data) {
    if (!(this instanceof StructType)) {
      return new StructType(arg, data)
    }
    debug('creating new struct instance')
    var store
    if (Buffer.isBuffer(arg)) {
      debug('using passed-in Buffer instance to back the struct', arg)
      assert(arg.length >= StructType.size, 'Buffer instance must be at least ' +
          StructType.size + ' bytes to back this struct type')
      store = arg
      arg = data
    } else {
      debug('creating new Buffer instance to back the struct (size: %d)', StructType.size)
      store = Buffer.alloc(StructType.size)
    }

    // set the backing Buffer store
    store.type = StructType
    this['ref.buffer'] = store

    if (arg) {
      for (var key in arg) {
        // hopefully hit the struct setters
        this[key] = arg[key]
      }
    }
    StructType._instanceCreated = true
  }

  // make instances inherit from the `proto`
  StructType.prototype = Object.create(proto, {
    constructor: {
        value: StructType
      , enumerable: false
      , writable: true
      , configurable: true
    }
  })

  StructType.defineProperty = defineProperty
  StructType.toString = toString
  StructType.fields = {}

  var opt = (arguments.length > 0 && arguments[1]) ? arguments[1] : {};
  // Setup the ref "type" interface. The constructor doubles as the "type" object
  StructType.size = 0
  StructType.alignment = 0
  StructType.indirection = 1
  StructType.isPacked = opt.packed ? Boolean(opt.packed) : false
  StructType.get = get
  StructType.set = set

  // Read the fields list and apply all the fields to the struct
  // TODO: Better arg handling... (maybe look at ES6 binary data API?)
  var arg = arguments[0]
  if (Array.isArray(arg)) {
    // legacy API
    arg.forEach(function (a) {
      var type = a[0]
      var name = a[1]
      StructType.defineProperty(name, type)
    })
  } else if (typeof arg === 'object') {
    Object.keys(arg).forEach(function (name) {
      var type = arg[name]
      StructType.defineProperty(name, type)
    })
  }

  return StructType
}

/**
 * The "get" function of the Struct "type" interface
 */

function get (buffer, offset) {
  debug('Struct "type" getter for buffer at offset', buffer, offset)
  if (offset > 0) {
    buffer = buffer.slice(offset)
  }
  return new this(buffer)
}

/**
 * The "set" function of the Struct "type" interface
 */

function set (buffer, offset, value) {
  debug('Struct "type" setter for buffer at offset', buffer, offset, value)
  var isStruct = value instanceof this
  if (isStruct) {
    // optimization: copy the buffer contents directly rather
    // than going through the ref-struct constructor
    value['ref.buffer'].copy(buffer, offset, 0, this.size)
  } else {
    if (offset > 0) {
      buffer = buffer.slice(offset)
    }
    new this(buffer, value)
  }
}

/**
 * Custom `toString()` override for struct type instances.
 */

function toString () {
  return '[StructType]'
}

/**
 * Adds a new field to the struct instance with the given name and type.
 * Note that this function will throw an Error if any instances of the struct
 * type have already been created, therefore this function must be called at the
 * beginning, before any instances are created.
 */

function defineProperty (name, type) {
  debug('defining new struct type field', name)

  // allow string types for convenience
  type = ref.coerceType(type)

  assert(!this._instanceCreated, 'an instance of this Struct type has already ' +
      'been created, cannot add new "fields" anymore')
  assert.equal('string', typeof name, 'expected a "string" field name')
  assert(type && /object|function/i.test(typeof type) && 'size' in type &&
      'indirection' in type
      , 'expected a "type" object describing the field type: "' + type + '"')
  assert(type.indirection > 1 || type.size > 0,
      '"type" object must have a size greater than 0')
  assert(!(name in this.prototype), 'the field "' + name +
      '" already exists in this Struct type')

  var field = {
    type: type
  }
  this.fields[name] = field

  // define the getter/setter property
  var desc = { enumerable: true , configurable: true }
  desc.get = function () {
    debug('getting "%s" struct field (offset: %d)', name, field.offset)
    return ref.get(this['ref.buffer'], field.offset, type)
  }
  desc.set = function (value) {
    debug('setting "%s" struct field (offset: %d)', name, field.offset, value)
    return ref.set(this['ref.buffer'], field.offset, value, type)
  }

  // calculate the new size and field offsets
  recalc(this)

  Object.defineProperty(this.prototype, name, desc)
}

function recalc (struct) {

  // reset size and alignment
  struct.size = 0
  struct.alignment = 0

  var fieldNames = Object.keys(struct.fields)

  // first loop through is to determine the `alignment` of this struct
  fieldNames.forEach(function (name) {
    var field = struct.fields[name]
    var type = field.type
    var alignment = type.alignment || ref.alignof.pointer
    if (type.indirection > 1) {
      alignment = ref.alignof.pointer
    }
    if (struct.isPacked) {
      struct.alignment = Math.min(struct.alignment || alignment, alignment)
    } else {
      struct.alignment = Math.max(struct.alignment, alignment)
    }
  })

  // second loop through sets the `offset` property on each "field"
  // object, and sets the `struct.size` as we go along
  fieldNames.forEach(function (name) {
    var field = struct.fields[name]
    var type = field.type

    if (null != type.fixedLength) {
      // "ref-array" types set the "fixedLength" prop. don't treat arrays like one
      // contiguous entity. instead, treat them like individual elements in the
      // struct. doing this makes the padding end up being calculated correctly.
      field.offset = addType(type.type)
      for (var i = 1; i < type.fixedLength; i++) {
        addType(type.type)
      }
    } else {
      field.offset = addType(type)
    }
  })

  function addType (type) {
    var offset = struct.size
    var align = type.indirection === 1 ? type.alignment : ref.alignof.pointer
    var padding = struct.isPacked ? 0 : (align - (offset % align)) % align
    var size = type.indirection === 1 ? type.size : ref.sizeof.pointer

    offset += padding

    if (!struct.isPacked) {
      assert.equal(offset % align, 0, "offset should align")
    }

    // adjust the "size" of the struct type
    struct.size = offset + size

    // return the calulated offset
    return offset
  }

  // any final padding?
  var left = struct.size % struct.alignment
  if (left > 0) {
    debug('additional padding to the end of struct:', struct.alignment - left)
    struct.size += struct.alignment - left
  }
}

/**
 * this is the custom prototype of Struct type instances.
 */

var proto = {}

/**
 * set a placeholder variable on the prototype so that defineProperty() will
 * throw an error if you try to define a struct field with the name "buffer".
 */

proto['ref.buffer'] = ref.NULL

/**
 * Flattens the Struct instance into a regular JavaScript Object. This function
 * "gets" all the defined properties.
 *
 * @api public
 */

proto.toObject = function toObject () {
  var obj = {}
  Object.keys(this.constructor.fields).forEach(function (k) {
    obj[k] = this[k]
  }, this)
  return obj
}

/**
 * Basic `JSON.stringify(struct)` support.
 */

proto.toJSON = function toJSON () {
  return this.toObject()
}

/**
 * `.inspect()` override. For the REPL.
 *
 * @api public
 */

proto.inspect = function inspect () {
  var obj = this.toObject()
  // add instance's "own properties"
  Object.keys(this).forEach(function (k) {
    obj[k] = this[k]
  }, this)
  return util.inspect(obj)
}

/**
 * returns a Buffer pointing to this struct data structure.
 */

proto.ref = function ref () {
  return this['ref.buffer']
}

return Struct;

};


/***/ }),

/***/ 141:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
/**
 * Colors.
 */

exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */
// eslint-disable-next-line complexity

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
    return true;
  } // Internet Explorer and Edge do not support colors.


  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  } // Is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632


  return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
  typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
  // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
  typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}
/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */


function formatArgs(args) {
  args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);

  if (!this.useColors) {
    return;
  }

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit'); // The final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into

  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function (match) {
    if (match === '%%') {
      return;
    }

    index++;

    if (match === '%c') {
      // We only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });
  args.splice(lastC, 0, c);
}
/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */


function log() {
  var _console;

  // This hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return (typeof console === "undefined" ? "undefined" : _typeof(console)) === 'object' && console.log && (_console = console).log.apply(_console, arguments);
}
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */


function save(namespaces) {
  try {
    if (namespaces) {
      exports.storage.setItem('debug', namespaces);
    } else {
      exports.storage.removeItem('debug');
    }
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */


function load() {
  var r;

  try {
    r = exports.storage.getItem('debug');
  } catch (error) {} // Swallow
  // XXX (@Qix-) should we be logging these?
  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG


  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}
/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */


function localstorage() {
  try {
    // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
    // The Browser also has localStorage in the global context.
    return localStorage;
  } catch (error) {// Swallow
    // XXX (@Qix-) should we be logging these?
  }
}

module.exports = __webpack_require__(491)(exports);
var formatters = module.exports.formatters;
/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
  try {
    return JSON.stringify(v);
  } catch (error) {
    return '[UnexpectedJSONParseError]: ' + error.message;
  }
};



/***/ }),

/***/ 491:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */
function setup(env) {
  createDebug.debug = createDebug;
  createDebug.default = createDebug;
  createDebug.coerce = coerce;
  createDebug.disable = disable;
  createDebug.enable = enable;
  createDebug.enabled = enabled;
  createDebug.humanize = __webpack_require__(154);
  Object.keys(env).forEach(function (key) {
    createDebug[key] = env[key];
  });
  /**
  * Active `debug` instances.
  */

  createDebug.instances = [];
  /**
  * The currently active debug mode names, and names to skip.
  */

  createDebug.names = [];
  createDebug.skips = [];
  /**
  * Map of special "%n" handling functions, for the debug "format" argument.
  *
  * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
  */

  createDebug.formatters = {};
  /**
  * Selects a color for a debug namespace
  * @param {String} namespace The namespace string for the for the debug instance to be colored
  * @return {Number|String} An ANSI color code for the given namespace
  * @api private
  */

  function selectColor(namespace) {
    var hash = 0;

    for (var i = 0; i < namespace.length; i++) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  }

  createDebug.selectColor = selectColor;
  /**
  * Create a debugger with the given `namespace`.
  *
  * @param {String} namespace
  * @return {Function}
  * @api public
  */

  function createDebug(namespace) {
    var prevTime;

    function debug() {
      // Disabled?
      if (!debug.enabled) {
        return;
      }

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var self = debug; // Set `diff` timestamp

      var curr = Number(new Date());
      var ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime;
      self.curr = curr;
      prevTime = curr;
      args[0] = createDebug.coerce(args[0]);

      if (typeof args[0] !== 'string') {
        // Anything else let's inspect with %O
        args.unshift('%O');
      } // Apply any `formatters` transformations


      var index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
        // If we encounter an escaped % then don't increase the array index
        if (match === '%%') {
          return match;
        }

        index++;
        var formatter = createDebug.formatters[format];

        if (typeof formatter === 'function') {
          var val = args[index];
          match = formatter.call(self, val); // Now we need to remove `args[index]` since it's inlined in the `format`

          args.splice(index, 1);
          index--;
        }

        return match;
      }); // Apply env-specific formatting (colors, etc.)

      createDebug.formatArgs.call(self, args);
      var logFn = self.log || createDebug.log;
      logFn.apply(self, args);
    }

    debug.namespace = namespace;
    debug.enabled = createDebug.enabled(namespace);
    debug.useColors = createDebug.useColors();
    debug.color = selectColor(namespace);
    debug.destroy = destroy;
    debug.extend = extend; // Debug.formatArgs = formatArgs;
    // debug.rawLog = rawLog;
    // env-specific initialization logic for debug instances

    if (typeof createDebug.init === 'function') {
      createDebug.init(debug);
    }

    createDebug.instances.push(debug);
    return debug;
  }

  function destroy() {
    var index = createDebug.instances.indexOf(this);

    if (index !== -1) {
      createDebug.instances.splice(index, 1);
      return true;
    }

    return false;
  }

  function extend(namespace, delimiter) {
    return createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
  }
  /**
  * Enables a debug mode by namespaces. This can include modes
  * separated by a colon and wildcards.
  *
  * @param {String} namespaces
  * @api public
  */


  function enable(namespaces) {
    createDebug.save(namespaces);
    createDebug.names = [];
    createDebug.skips = [];
    var i;
    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
    var len = split.length;

    for (i = 0; i < len; i++) {
      if (!split[i]) {
        // ignore empty strings
        continue;
      }

      namespaces = split[i].replace(/\*/g, '.*?');

      if (namespaces[0] === '-') {
        createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
      } else {
        createDebug.names.push(new RegExp('^' + namespaces + '$'));
      }
    }

    for (i = 0; i < createDebug.instances.length; i++) {
      var instance = createDebug.instances[i];
      instance.enabled = createDebug.enabled(instance.namespace);
    }
  }
  /**
  * Disable debug output.
  *
  * @api public
  */


  function disable() {
    createDebug.enable('');
  }
  /**
  * Returns true if the given mode name is enabled, false otherwise.
  *
  * @param {String} name
  * @return {Boolean}
  * @api public
  */


  function enabled(name) {
    if (name[name.length - 1] === '*') {
      return true;
    }

    var i;
    var len;

    for (i = 0, len = createDebug.skips.length; i < len; i++) {
      if (createDebug.skips[i].test(name)) {
        return false;
      }
    }

    for (i = 0, len = createDebug.names.length; i < len; i++) {
      if (createDebug.names[i].test(name)) {
        return true;
      }
    }

    return false;
  }
  /**
  * Coerce `val`.
  *
  * @param {Mixed} val
  * @return {Mixed}
  * @api private
  */


  function coerce(val) {
    if (val instanceof Error) {
      return val.stack || val.message;
    }

    return val;
  }

  createDebug.enable(createDebug.load());
  return createDebug;
}

module.exports = setup;



/***/ }),

/***/ 727:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */
if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
  module.exports = __webpack_require__(141);
} else {
  module.exports = __webpack_require__(510);
}



/***/ }),

/***/ 510:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


/**
 * Module dependencies.
 */
var tty = __webpack_require__(867);

var util = __webpack_require__(669);
/**
 * This is the Node.js implementation of `debug()`.
 */


exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
  // Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
  // eslint-disable-next-line import/no-extraneous-dependencies
  var supportsColor = __webpack_require__(568);

  if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
    exports.colors = [20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 214, 215, 220, 221];
  }
} catch (error) {} // Swallow - we only care if `supports-color` is available; it doesn't have to be.

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */


exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return /^debug_/i.test(key);
}).reduce(function (obj, key) {
  // Camel-case
  var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function (_, k) {
    return k.toUpperCase();
  }); // Coerce string value into JS value

  var val = process.env[key];

  if (/^(yes|on|true|enabled)$/i.test(val)) {
    val = true;
  } else if (/^(no|off|false|disabled)$/i.test(val)) {
    val = false;
  } else if (val === 'null') {
    val = null;
  } else {
    val = Number(val);
  }

  obj[prop] = val;
  return obj;
}, {});
/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
}
/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */


function formatArgs(args) {
  var name = this.namespace,
      useColors = this.useColors;

  if (useColors) {
    var c = this.color;
    var colorCode = "\x1B[3" + (c < 8 ? c : '8;5;' + c);
    var prefix = "  ".concat(colorCode, ";1m").concat(name, " \x1B[0m");
    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + "\x1B[0m");
  } else {
    args[0] = getDate() + name + ' ' + args[0];
  }
}

function getDate() {
  if (exports.inspectOpts.hideDate) {
    return '';
  }

  return new Date().toISOString() + ' ';
}
/**
 * Invokes `util.format()` with the specified arguments and writes to stderr.
 */


function log() {
  return process.stderr.write(util.format.apply(util, arguments) + '\n');
}
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */


function save(namespaces) {
  if (namespaces) {
    process.env.DEBUG = namespaces;
  } else {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */


function load() {
  return process.env.DEBUG;
}
/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */


function init(debug) {
  debug.inspectOpts = {};
  var keys = Object.keys(exports.inspectOpts);

  for (var i = 0; i < keys.length; i++) {
    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  }
}

module.exports = __webpack_require__(491)(exports);
var formatters = module.exports.formatters;
/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts)
    .split('\n')
    .map(function (str) { return str.trim(); })
    .join(' ');
};
/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */


formatters.O = function (v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};



/***/ }),

/***/ 154:
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\-?\d?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),

/***/ 568:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const os = __webpack_require__(87);
const tty = __webpack_require__(867);
const hasFlag = __webpack_require__(372);

const {env} = process;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false') ||
	hasFlag('color=never')) {
	forceColor = 0;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = 1;
}

if ('FORCE_COLOR' in env) {
	if (env.FORCE_COLOR === 'true') {
		forceColor = 1;
	} else if (env.FORCE_COLOR === 'false') {
		forceColor = 0;
	} else {
		forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
	}
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(haveStream, streamIsTTY) {
	if (forceColor === 0) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (haveStream && !streamIsTTY && forceColor === undefined) {
		return 0;
	}

	const min = forceColor || 0;

	if (env.TERM === 'dumb') {
		return min;
	}

	if (process.platform === 'win32') {
		// Windows 10 build 10586 is the first Windows release that supports 256 colors.
		// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream, stream && stream.isTTY);
	return translateLevel(level);
}

module.exports = {
	supportsColor: getSupportLevel,
	stdout: translateLevel(supportsColor(true, tty.isatty(1))),
	stderr: translateLevel(supportsColor(true, tty.isatty(2)))
};


/***/ }),

/***/ 357:
/***/ ((module) => {

"use strict";
module.exports = require("assert");;

/***/ }),

/***/ 293:
/***/ ((module) => {

"use strict";
module.exports = require("buffer");;

/***/ }),

/***/ 747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");;

/***/ }),

/***/ 87:
/***/ ((module) => {

"use strict";
module.exports = require("os");;

/***/ }),

/***/ 622:
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ }),

/***/ 867:
/***/ ((module) => {

"use strict";
module.exports = require("tty");;

/***/ }),

/***/ 669:
/***/ ((module) => {

"use strict";
module.exports = require("util");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __webpack_require__ !== 'undefined') __webpack_require__.ab = __dirname + "/";/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__(307);

})();

module.exports = __webpack_exports__;
/******/ })()
;