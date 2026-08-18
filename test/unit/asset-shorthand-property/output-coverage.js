/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 941:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

let toolPath;

if (process.env.RELOCATOR_TOOL_PATH) {
  toolPath = process.env.RELOCATOR_TOOL_PATH;
} else {
  toolPath = __webpack_require__.ab + "tool.js";
}

const conditionalToolPath = isHarmony ? __webpack_require__.ab + "tool.js" : __webpack_require__.ab + "other-tool.js";

module.exports = {
  name: "demo",
  toolPath: __webpack_require__.ab + "tool.js",
  conditionalToolPath,
};


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
/******/ 	/* webpack/runtime/asset-relocator-loader */
/******/ 	if (typeof __webpack_require__ !== 'undefined') __webpack_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(941);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;