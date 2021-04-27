/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 622:
/***/ ((module) => {

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
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {

const path = __webpack_require__(622);
// Load Google's well-known proto files that aren't exposed by Protobuf.js.
{
    // Protobuf.js exposes: any, duration, empty, field_mask, struct, timestamp,
    // and wrappers. compiler/plugin is excluded in Protobuf.js and here.
    var wellKnownProtos = ['asset1', 'asset2'];
    var sourceDir = __webpack_require__.ab + "assets";
    var _i;
    for (_i = 0; _i < wellKnownProtos_1.length; _i++) {
        var proto = wellKnownProtos[_i];
        var file = __webpack_require__.ab + "assets/" + proto + '.txt';
        var descriptor_1 = Protobuf.loadSync(file).toJSON();
        // @ts-ignore
        Protobuf.common(proto, descriptor_1.nested.google.nested);
    }
}
//# sourceMappingURL=index.js.map
})();

module.exports = __webpack_exports__;
/******/ })()
;