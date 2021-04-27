/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 498:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const express = __webpack_require__(127);
const path = __webpack_require__(622);

const app = express();

app.engine("pug", __webpack_require__(777).__express).set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.get("*", (req, res) => {
  res.render("index");
});

module.exports = app;


/***/ }),

/***/ 127:
/***/ ((module) => {

"use strict";
module.exports = require("express");;

/***/ }),

/***/ 622:
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ }),

/***/ 777:
/***/ ((module) => {

"use strict";
module.exports = require("pug");;

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
/******/ 	var __webpack_exports__ = __webpack_require__(498);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;