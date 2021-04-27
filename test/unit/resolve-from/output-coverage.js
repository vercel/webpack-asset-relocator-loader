/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 937:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const path = __webpack_require__(622);
const Module = __webpack_require__(282);

const resolveFrom = (fromDir, moduleId, silent) => {
	if (typeof fromDir !== 'string') {
		throw new TypeError(`Expected \`fromDir\` to be of type \`string\`, got \`${typeof fromDir}\``);
	}

	if (typeof moduleId !== 'string') {
		throw new TypeError(`Expected \`moduleId\` to be of type \`string\`, got \`${typeof moduleId}\``);
	}

	fromDir = path.resolve(fromDir);
	const fromFile = path.join(fromDir, 'noop.js');

	const resolveFileName = () => Module._resolveFilename(moduleId, {
		id: fromFile,
		filename: fromFile,
		paths: Module._nodeModulePaths(fromDir)
	});

	if (silent) {
		try {
			return resolveFileName();
		} catch (err) {
			return null;
		}
	}

	return resolveFileName();
};

module.exports = (fromDir, moduleId) => resolveFrom(fromDir, moduleId);
module.exports.silent = (fromDir, moduleId) => resolveFrom(fromDir, moduleId, true);


/***/ }),

/***/ 564:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var resolveFrom = __webpack_require__(937);
var x = /*require.resolve*/( 564);
require(x);


/***/ }),

/***/ 282:
/***/ ((module) => {

"use strict";
module.exports = require("module");;

/***/ }),

/***/ 622:
/***/ ((module) => {

"use strict";
module.exports = require("path");;

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
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(564);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;