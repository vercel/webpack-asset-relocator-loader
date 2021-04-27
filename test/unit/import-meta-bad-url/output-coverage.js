/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __webpack_require__ !== 'undefined') __webpack_require__.ab = __dirname + "/";/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

;// CONCATENATED MODULE: external "fs"
const external_fs_namespaceObject = require("fs");;
;// CONCATENATED MODULE: ./test/unit/import-meta-bad-url/input.js


console.log((0,external_fs_namespaceObject.readFileSync)(new URL(unknown ? './asset1.txt' : './asset2.txt', 'not-a-url')));
console.log((0,external_fs_namespaceObject.readFileSync)(new URL(unknown ? 'a--b' : './asset2.txt')));
console.log((0,external_fs_namespaceObject.readFileSync)(new URL(unknown ? './asset1.txt' : 'a--b')));
console.log((0,external_fs_namespaceObject.readFileSync)(new URL('file:///none')));
console.log((0,external_fs_namespaceObject.readFileSync)(new URL('--')));
console.log((0,external_fs_namespaceObject.readFileSync)(new URL('--', '--')));
console.log((0,external_fs_namespaceObject.readFileSync)(new URL()));
console.log((0,external_fs_namespaceObject.readFileSync)(new URL('./test', unknown)));
console.log((0,external_fs_namespaceObject.readFileSync)(new URL(unknown)));

module.exports = __webpack_exports__;
/******/ })()
;