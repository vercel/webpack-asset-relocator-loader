/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");;

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
const fs = __webpack_require__(747);

fs.readFile('./asset1.txt')

fs.readFile(__webpack_require__.ab + "asset2.txt")

const _basePath = __webpack_require__.ab + "fs-emission";
const asset3 = 'asset3.txt';
fs.readFileSync(__webpack_require__.ab + "asset3.txt", 'utf8');

})();

module.exports = __webpack_exports__;
/******/ })()
;