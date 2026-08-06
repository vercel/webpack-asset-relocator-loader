/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 635:
/***/ ((module) => {

// Regression test: the loader tracks `counter = null` as a known binding
// value, and previously crashed statically evaluating `counter + 1n`
// ("TypeError: Cannot mix BigInt and other types") instead of treating
// the expression as not statically computable.
// Pattern from dd-trace's packages/dd-trace/src/appsec/downstream_requests.js.
const KNUTH_FACTOR = 11400714819323199488n;
const UINT64_MAX = (1n << 64n) - 1n;

let counter;

function enable () {
  counter = 0n;
}

function disable () {
  counter = null;
}

function next () {
  counter = (counter + 1n) & UINT64_MAX;
  return (counter * KNUTH_FACTOR) % UINT64_MAX;
}

// unary + on a known BigInt binding previously threw
// "Cannot convert a BigInt value to a number"
const coerced = +KNUTH_FACTOR ? 1 : 0;

module.exports = { enable, disable, next, coerced };


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
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(635);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;