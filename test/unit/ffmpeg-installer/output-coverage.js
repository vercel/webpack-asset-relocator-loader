/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 605:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var os = __webpack_require__(87);
var fs = __webpack_require__(747);
var path = __webpack_require__(622);

var verifyFile;

var platform = (os.platform() + '-' + os.arch()) && '.';

var packageName = '@ffmpeg-installer/' + platform;

var binary = os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg.exe';

var npm3Path = path.resolve(__dirname, '..', platform);
var npm2Path = __webpack_require__.ab + "ffmpeg-installer";

var npm3Binary = path.join(npm3Path, binary);
var npm2Binary = __webpack_require__.ab + "ffmpeg.exe";

var npm3Package = path.join(npm3Path, 'package.json');
var npm2Package = path.join(npm2Path, 'package.json');

var ffmpegPath, packageJson;

if (verifyFile(npm3Binary)) {
    ffmpegPath = npm3Binary;
} else if (verifyFile(__webpack_require__.ab + "ffmpeg.exe")) {
    ffmpegPath = __webpack_require__.ab + "ffmpeg.exe";
} else {
    throw 'Could not find ffmpeg executable, tried "' + npm3Binary + '" and "' + npm2Binary + '"';
}

var version = packageJson.ffmpeg || packageJson.version;
var url = packageJson.homepage;

module.exports = {
    path: __webpack_require__.ab + "ffmpeg.exe",
    version: version,
    url: url
};

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
let { path } = __webpack_require__(605);
console.log(path);
})();

module.exports = __webpack_exports__;
/******/ })()
;