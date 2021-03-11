module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/ 	if (typeof __webpack_require__ !== 'undefined') __webpack_require__.ab = __dirname + "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

!function(f) {
  if (true) module.exports = f();
  else {}
}(function() {
  return function() {
      return function e(t, n, r) {
          function s(o, u) {
              if (!n[o]) {
                  if (!t[o]) {
                      var a = require;
                      if (!u && a) return a(o, !0);
                      if (i) return i(o, !0);
                      var f = new Error("Cannot find module '" + o + "'");
                      throw f.code = "MODULE_NOT_FOUND", f
                  }
                  var l = n[o] = {
                      exports: {}
                  };
                  t[o][0].call(l.exports, function(e) {
                      var n = t[o][1][e];
                      return s(n || e)
                  }, l, l.exports, e, t, n, r)
              }
              return n[o].exports
          }
          for (var i = require, o = 0; o < r.length; o++) s(r[o]);
          return s
      }
  }()({
      1: [function(require, module, exports) {
          var http = require("http"),
              https = require("https"),
              url = require("url"),
              qs = require("querystring");
          module.exports = function(options, callback) {
              if (!options.url) throw Error("options.url required");
              var promise;
              callback || (promise = new Promise(function(res, rej) {
                  callback = function(err, result) {
                      err ? rej(err) : res(result)
                  }
              }));
              var opts = url.parse(options.url);
              if (options.data) {
                  var isSearch = !!opts.search;
                  options.url += (isSearch ? "&" : "?") + qs.stringify(options.data), opts = url.parse(options.url)
              }
              var method = "https:" === opts.protocol ? https.get : http.get;
              return opts.headers = options.headers || {}, opts.headers["User-Agent"] = opts.headers["User-Agent"] || "tiny-http", opts.headers["Content-Type"] = opts.headers["Content-Type"] || "application/json", method(opts, function(res) {
                  var raw = [];
                  if (!(res.statusCode >= 200 && res.statusCode < 300)) return callback(Error("GET failed with: " + res.statusCode)), void res.resume();
                  res.on("data", function(chunk) {
                      raw.push(chunk)
                  }), res.on("end", function() {
                      var err = null,
                          result = null;
                      try {
                          var isJSON = res.headers["content-type"].startsWith("application/json");
                          if (result = Buffer.concat(raw), !options.buffer) {
                              var strRes = result.toString();
                              result = strRes && isJSON ? JSON.parse(strRes) : strRes
                          }
                      } catch (e) {
                          err = e
                      }
                      callback(err, {
                          body: result,
                          headers: res.headers
                      })
                  })
              }).on("error", callback), promise
          }
      }, {
          http: void 0,
          https: void 0,
          querystring: void 0,
          url: void 0
      }],
      2: [function(require, module, exports) {
          var qs = require("querystring"),
              http = require("http"),
              https = require("https"),
              FormData = require("@brianleroux/form-data"),
              url = require("url");
          module.exports = function(httpMethod, options, callback) {
              if (!options.url) throw Error("options.url required");
              var promise;
              callback || (promise = new Promise(function(res, rej) {
                  callback = function(err, result) {
                      err ? rej(err) : res(result)
                  }
              }));
              var opts = url.parse(options.url),
                  method = "https:" === opts.protocol ? https.request : http.request;
              if ("DELETE" === httpMethod && options.data) {
                  var isSearch = !!opts.search;
                  options.url += (isSearch ? "&" : "?") + qs.stringify(options.data), opts = url.parse(options.url)
              }
              opts.method = httpMethod, opts.headers = options.headers || {}, opts.headers["User-Agent"] = opts.headers["User-Agent"] || "tiny-http", opts.headers["Content-Type"] = opts.headers["Content-Type"] || "application/json; charset=utf-8";
              var postData = qs.stringify(options.data || {});

              function is(headers, type) {
                  var isU = headers["Content-Type"] && headers["Content-Type"].startsWith(type),
                      isL = headers["content-type"] && headers["content-type"].startsWith(type);
                  return isU || isL
              }
              is(opts.headers, "application/json") && (postData = JSON.stringify(options.data || {})), opts.headers["Content-Length"] = Buffer.byteLength(postData);
              var isMultipart = is(opts.headers, "multipart/form-data");
              isMultipart && (method = function(params, streamback) {
                  var form = new FormData;
                  Object.keys(options.data).forEach(k => {
                      form.append(k, options.data[k])
                  }), delete opts.headers["Content-Type"], delete opts.headers["content-type"], delete opts.headers["Content-Length"], delete opts.headers["content-length"], form.submit(opts, function(err, res) {
                      err ? callback(err) : streamback(res)
                  })
              });
              var req = method(opts, function(res) {
                  var raw = [],
                      ok = res.statusCode >= 200 && res.statusCode < 300;
                  res.on("data", function(chunk) {
                      raw.push(chunk)
                  }), res.on("end", function() {
                      var err = null,
                          result = null;
                      try {
                          if (result = Buffer.concat(raw), !options.buffer) {
                              var isJSON = is(res.headers, "application/json"),
                                  strRes = result.toString();
                              result = strRes && isJSON ? JSON.parse(strRes) : strRes
                          }
                      } catch (e) {
                          err = e
                      }
                      ok ? callback(err, {
                          body: result,
                          headers: res.headers
                      }) : ((err = Error(httpMethod + " failed with: " + res.statusCode)).raw = res, err.body = result, callback(err))
                  })
              });
              return isMultipart || (req.on("error", callback), req.write(postData), req.end()), promise
          }
      }, {
          "@brianleroux/form-data": 4,
          http: void 0,
          https: void 0,
          querystring: void 0,
          url: void 0
      }],
      3: [function(require, module, exports) {
          var _read = require("./_read"),
              _write = require("./_write");
          module.exports = {
              get: _read,
              post: _write.bind({}, "POST"),
              put: _write.bind({}, "PUT"),
              del: _write.bind({}, "DELETE")
          }
      }, {
          "./_read": 1,
          "./_write": 2
      }],
      4: [function(require, module, exports) {
          var CombinedStream = require("combined-stream"),
              util = require("util"),
              path = require("path"),
              http = require("http"),
              https = require("https"),
              parseUrl = require("url").parse,
              fs = require("fs"),
              mime = {
                  lookup: require("tiny-mime-lookup")
              },
              asynckit = require("asynckit"),
              populate = require("./populate.js");

          function FormData(options) {
              if (!(this instanceof FormData)) return new FormData;
              for (var option in this._overheadLength = 0, this._valueLength = 0, this._valuesToMeasure = [], CombinedStream.call(this), options = options || {}) this[option] = options[option]
          }
          module.exports = FormData, util.inherits(FormData, CombinedStream), FormData.LINE_BREAK = "\r\n", FormData.DEFAULT_CONTENT_TYPE = "application/octet-stream", FormData.prototype.append = function(field, value, options) {
              "string" == typeof(options = options || {}) && (options = {
                  filename: options
              });
              var append = CombinedStream.prototype.append.bind(this);
              if ("number" == typeof value && (value = "" + value), util.isArray(value)) this._error(new Error("Arrays are not supported."));
              else {
                  var header = this._multiPartHeader(field, value, options),
                      footer = this._multiPartFooter();
                  append(header), append(value), append(footer), this._trackLength(header, value, options)
              }
          }, FormData.prototype._trackLength = function(header, value, options) {
              var valueLength = 0;
              null != options.knownLength ? valueLength += +options.knownLength : Buffer.isBuffer(value) ? valueLength = value.length : "string" == typeof value && (valueLength = Buffer.byteLength(value)), this._valueLength += valueLength, this._overheadLength += Buffer.byteLength(header) + FormData.LINE_BREAK.length, value && (value.path || value.readable && value.hasOwnProperty("httpVersion")) && (options.knownLength || this._valuesToMeasure.push(value))
          }, FormData.prototype._lengthRetriever = function(value, callback) {
              value.hasOwnProperty("fd") ? void 0 != value.end && value.end != 1 / 0 && void 0 != value.start ? callback(null, value.end + 1 - (value.start ? value.start : 0)) : fs.stat(value.path, function(err, stat) {
                  var fileSize;
                  err ? callback(err) : (fileSize = stat.size - (value.start ? value.start : 0), callback(null, fileSize))
              }) : value.hasOwnProperty("httpVersion") ? callback(null, +value.headers["content-length"]) : value.hasOwnProperty("httpModule") ? (value.on("response", function(response) {
                  value.pause(), callback(null, +response.headers["content-length"])
              }), value.resume()) : callback("Unknown stream")
          }, FormData.prototype._multiPartHeader = function(field, value, options) {
              if ("string" == typeof options.header) return options.header;
              var header, contentDisposition = this._getContentDisposition(value, options),
                  contentType = this._getContentType(value, options),
                  contents = "",
                  headers = {
                      "Content-Disposition": ["form-data", 'name="' + field + '"'].concat(contentDisposition || []),
                      "Content-Type": [].concat(contentType || [])
                  };
              for (var prop in "object" == typeof options.header && populate(headers, options.header), headers) headers.hasOwnProperty(prop) && null != (header = headers[prop]) && (Array.isArray(header) || (header = [header]), header.length && (contents += prop + ": " + header.join("; ") + FormData.LINE_BREAK));
              return "--" + this.getBoundary() + FormData.LINE_BREAK + contents + FormData.LINE_BREAK
          }, FormData.prototype._getContentDisposition = function(value, options) {
              var filename, contentDisposition;
              return "string" == typeof options.filepath ? filename = path.normalize(options.filepath).replace(/\\/g, "/") : options.filename || value.name || value.path ? filename = path.basename(options.filename || value.name || value.path) : value.readable && value.hasOwnProperty("httpVersion") && (filename = path.basename(value.client._httpMessage.path)), filename && (contentDisposition = 'filename="' + filename + '"'), contentDisposition
          }, FormData.prototype._getContentType = function(value, options) {
              var contentType = options.contentType;
              return !contentType && value.name && (contentType = mime.lookup(value.name)), !contentType && value.path && (contentType = mime.lookup(value.path)), !contentType && value.readable && value.hasOwnProperty("httpVersion") && (contentType = value.headers["content-type"]), contentType || !options.filepath && !options.filename || (contentType = mime.lookup(options.filepath || options.filename)), contentType || "object" != typeof value || (contentType = FormData.DEFAULT_CONTENT_TYPE), contentType
          }, FormData.prototype._multiPartFooter = function() {
              return function(next) {
                  var footer = FormData.LINE_BREAK;
                  0 === this._streams.length && (footer += this._lastBoundary()), next(footer)
              }.bind(this)
          }, FormData.prototype._lastBoundary = function() {
              return "--" + this.getBoundary() + "--" + FormData.LINE_BREAK
          }, FormData.prototype.getHeaders = function(userHeaders) {
              var header, formHeaders = {
                  "content-type": "multipart/form-data; boundary=" + this.getBoundary()
              };
              for (header in userHeaders) userHeaders.hasOwnProperty(header) && (formHeaders[header.toLowerCase()] = userHeaders[header]);
              return formHeaders
          }, FormData.prototype.getBoundary = function() {
              return this._boundary || this._generateBoundary(), this._boundary
          }, FormData.prototype._generateBoundary = function() {
              for (var boundary = "--------------------------", i = 0; i < 24; i++) boundary += Math.floor(10 * Math.random()).toString(16);
              this._boundary = boundary
          }, FormData.prototype.getLengthSync = function() {
              var knownLength = this._overheadLength + this._valueLength;
              return this._streams.length && (knownLength += this._lastBoundary().length), this.hasKnownLength() || this._error(new Error("Cannot calculate proper length in synchronous way.")), knownLength
          }, FormData.prototype.hasKnownLength = function() {
              var hasKnownLength = !0;
              return this._valuesToMeasure.length && (hasKnownLength = !1), hasKnownLength
          }, FormData.prototype.getLength = function(cb) {
              var knownLength = this._overheadLength + this._valueLength;
              this._streams.length && (knownLength += this._lastBoundary().length), this._valuesToMeasure.length ? asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
                  err ? cb(err) : (values.forEach(function(length) {
                      knownLength += length
                  }), cb(null, knownLength))
              }) : process.nextTick(cb.bind(this, null, knownLength))
          }, FormData.prototype.submit = function(params, cb) {
              var request, options, defaults = {
                  method: "post"
              };
              return "string" == typeof params ? (params = parseUrl(params), options = populate({
                  port: params.port,
                  path: params.pathname,
                  host: params.hostname,
                  protocol: params.protocol
              }, defaults)) : (options = populate(params, defaults)).port || (options.port = "https:" == options.protocol ? 443 : 80), options.headers = this.getHeaders(params.headers), request = "https:" == options.protocol ? https.request(options) : http.request(options), this.getLength(function(err, length) {
                  err ? this._error(err) : (request.setHeader("Content-Length", length), this.pipe(request), cb && (request.on("error", cb), request.on("response", cb.bind(this, null))))
              }.bind(this)), request
          }, FormData.prototype._error = function(err) {
              this.error || (this.error = err, this.pause(), this.emit("error", err))
          }, FormData.prototype.toString = function() {
              return "[object FormData]"
          }
      }, {
          "./populate.js": 5,
          asynckit: 6,
          "combined-stream": 16,
          fs: void 0,
          http: void 0,
          https: void 0,
          path: void 0,
          "tiny-mime-lookup": 18,
          url: void 0,
          util: void 0
      }],
      5: [function(require, module, exports) {
          module.exports = function(dst, src) {
              return Object.keys(src).forEach(function(prop) {
                  dst[prop] = dst[prop] || src[prop]
              }), dst
          }
      }, {}],
      6: [function(require, module, exports) {
          module.exports = {
              parallel: require("./parallel.js"),
              serial: require("./serial.js"),
              serialOrdered: require("./serialOrdered.js")
          }
      }, {
          "./parallel.js": 13,
          "./serial.js": 14,
          "./serialOrdered.js": 15
      }],
      7: [function(require, module, exports) {
          module.exports = function(state) {
              Object.keys(state.jobs).forEach(function(key) {
                  "function" == typeof this.jobs[key] && this.jobs[key]()
              }.bind(state)), state.jobs = {}
          }
      }, {}],
      8: [function(require, module, exports) {
          var defer = require("./defer.js");
          module.exports = function(callback) {
              var isAsync = !1;
              return defer(function() {
                      isAsync = !0
                  }),
                  function(err, result) {
                      isAsync ? callback(err, result) : defer(function() {
                          callback(err, result)
                      })
                  }
          }
      }, {
          "./defer.js": 9
      }],
      9: [function(require, module, exports) {
          module.exports = function(fn) {
              var nextTick = "function" == typeof setImmediate ? setImmediate : "object" == typeof process && "function" == typeof process.nextTick ? process.nextTick : null;
              nextTick ? nextTick(fn) : setTimeout(fn, 0)
          }
      }, {}],
      10: [function(require, module, exports) {
          var async = require("./async.js"), abort = require("./abort.js");
          module.exports = function(list, iterator, state, callback) {
              var key = state.keyedList ? state.keyedList[state.index] : state.index;
              state.jobs[key] = function(iterator, key, item, callback) {
                  var aborter;
                  aborter = 2 == iterator.length ? iterator(item, async (callback)) : iterator(item, key, async (callback));
                  return aborter
              }(iterator, key, list[key], function(error, output) {
                  key in state.jobs && (delete state.jobs[key], error ? abort(state) : state.results[key] = output, callback(error, state.results))
              })
          }
      }, {
          "./abort.js": 7,
          "./async.js": 8
      }],
      11: [function(require, module, exports) {
          module.exports = function(list, sortMethod) {
              var isNamedList = !Array.isArray(list),
                  initState = {
                      index: 0,
                      keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
                      jobs: {},
                      results: isNamedList ? {} : [],
                      size: isNamedList ? Object.keys(list).length : list.length
                  };
              sortMethod && initState.keyedList.sort(isNamedList ? sortMethod : function(a, b) {
                  return sortMethod(list[a], list[b])
              });
              return initState
          }
      }, {}],
      12: [function(require, module, exports) {
          var abort = require("./abort.js"),
              async = require("./async.js");
          module.exports = function(callback) {
              if (!Object.keys(this.jobs).length) return;
              this.index = this.size, abort(this), async (callback)(null, this.results)
          }
      }, {
          "./abort.js": 7,
          "./async.js": 8
      }],
      13: [function(require, module, exports) {
          var iterate = require("./lib/iterate.js"),
              initState = require("./lib/state.js"),
              terminator = require("./lib/terminator.js");
          module.exports = function(list, iterator, callback) {
              var state = initState(list);
              for (; state.index < (state.keyedList || list).length;) iterate(list, iterator, state, function(error, result) {
                  error ? callback(error, result) : 0 !== Object.keys(state.jobs).length || callback(null, state.results)
              }), state.index++;
              return terminator.bind(state, callback)
          }
      }, {
          "./lib/iterate.js": 10,
          "./lib/state.js": 11,
          "./lib/terminator.js": 12
      }],
      14: [function(require, module, exports) {
          var serialOrdered = require("./serialOrdered.js");
          module.exports = function(list, iterator, callback) {
              return serialOrdered(list, iterator, null, callback)
          }
      }, {
          "./serialOrdered.js": 15
      }],
      15: [function(require, module, exports) {
          var iterate = require("./lib/iterate.js"),
              initState = require("./lib/state.js"),
              terminator = require("./lib/terminator.js");

          function ascending(a, b) {
              return a < b ? -1 : a > b ? 1 : 0
          }
          module.exports = function(list, iterator, sortMethod, callback) {
              var state = initState(list, sortMethod);
              return iterate(list, iterator, state, function iteratorHandler(error, result) {
                  error ? callback(error, result) : (state.index++, state.index < (state.keyedList || list).length ? iterate(list, iterator, state, iteratorHandler) : callback(null, state.results))
              }), terminator.bind(state, callback)
          }, module.exports.ascending = ascending, module.exports.descending = function(a, b) {
              return -1 * ascending(a, b)
          }
      }, {
          "./lib/iterate.js": 10,
          "./lib/state.js": 11,
          "./lib/terminator.js": 12
      }],
      16: [function(require, module, exports) {
          var util = require("util"),
              Stream = require("stream").Stream,
              DelayedStream = require("delayed-stream");

          function CombinedStream() {
              this.writable = !1, this.readable = !0, this.dataSize = 0, this.maxDataSize = 2097152, this.pauseStreams = !0, this._released = !1, this._streams = [], this._currentStream = null
          }
          module.exports = CombinedStream, util.inherits(CombinedStream, Stream), CombinedStream.create = function(options) {
              var combinedStream = new this;
              for (var option in options = options || {}) combinedStream[option] = options[option];
              return combinedStream
          }, CombinedStream.isStreamLike = function(stream) {
              return "function" != typeof stream && "string" != typeof stream && "boolean" != typeof stream && "number" != typeof stream && !Buffer.isBuffer(stream)
          }, CombinedStream.prototype.append = function(stream) {
              if (CombinedStream.isStreamLike(stream)) {
                  if (!(stream instanceof DelayedStream)) {
                      var newStream = DelayedStream.create(stream, {
                          maxDataSize: 1 / 0,
                          pauseStream: this.pauseStreams
                      });
                      stream.on("data", this._checkDataSize.bind(this)), stream = newStream
                  }
                  this._handleErrors(stream), this.pauseStreams && stream.pause()
              }
              return this._streams.push(stream), this
          }, CombinedStream.prototype.pipe = function(dest, options) {
              return Stream.prototype.pipe.call(this, dest, options), this.resume(), dest
          }, CombinedStream.prototype._getNext = function() {
              this._currentStream = null;
              var stream = this._streams.shift();
              void 0 !== stream ? "function" == typeof stream ? stream(function(stream) {
                  CombinedStream.isStreamLike(stream) && (stream.on("data", this._checkDataSize.bind(this)), this._handleErrors(stream)), this._pipeNext(stream)
              }.bind(this)) : this._pipeNext(stream) : this.end()
          }, CombinedStream.prototype._pipeNext = function(stream) {
              if (this._currentStream = stream, CombinedStream.isStreamLike(stream)) return stream.on("end", this._getNext.bind(this)), void stream.pipe(this, {
                  end: !1
              });
              var value = stream;
              this.write(value), this._getNext()
          }, CombinedStream.prototype._handleErrors = function(stream) {
              var self = this;
              stream.on("error", function(err) {
                  self._emitError(err)
              })
          }, CombinedStream.prototype.write = function(data) {
              this.emit("data", data)
          }, CombinedStream.prototype.pause = function() {
              this.pauseStreams && (this.pauseStreams && this._currentStream && "function" == typeof this._currentStream.pause && this._currentStream.pause(), this.emit("pause"))
          }, CombinedStream.prototype.resume = function() {
              this._released || (this._released = !0, this.writable = !0, this._getNext()), this.pauseStreams && this._currentStream && "function" == typeof this._currentStream.resume && this._currentStream.resume(), this.emit("resume")
          }, CombinedStream.prototype.end = function() {
              this._reset(), this.emit("end")
          }, CombinedStream.prototype.destroy = function() {
              this._reset(), this.emit("close")
          }, CombinedStream.prototype._reset = function() {
              this.writable = !1, this._streams = [], this._currentStream = null
          }, CombinedStream.prototype._checkDataSize = function() {
              if (this._updateDataSize(), !(this.dataSize <= this.maxDataSize)) {
                  var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
                  this._emitError(new Error(message))
              }
          }, CombinedStream.prototype._updateDataSize = function() {
              this.dataSize = 0;
              var self = this;
              this._streams.forEach(function(stream) {
                  stream.dataSize && (self.dataSize += stream.dataSize)
              }), this._currentStream && this._currentStream.dataSize && (this.dataSize += this._currentStream.dataSize)
          }, CombinedStream.prototype._emitError = function(err) {
              this._reset(), this.emit("error", err)
          }
      }, {
          "delayed-stream": 17,
          stream: void 0,
          util: void 0
      }],
      17: [function(require, module, exports) {
          var Stream = require("stream").Stream,
              util = require("util");

          function DelayedStream() {
              this.source = null, this.dataSize = 0, this.maxDataSize = 1048576, this.pauseStream = !0, this._maxDataSizeExceeded = !1, this._released = !1, this._bufferedEvents = []
          }
          module.exports = DelayedStream, util.inherits(DelayedStream, Stream), DelayedStream.create = function(source, options) {
              var delayedStream = new this;
              for (var option in options = options || {}) delayedStream[option] = options[option];
              delayedStream.source = source;
              var realEmit = source.emit;
              return source.emit = function() {
                  return delayedStream._handleEmit(arguments), realEmit.apply(source, arguments)
              }, source.on("error", function() {}), delayedStream.pauseStream && source.pause(), delayedStream
          }, Object.defineProperty(DelayedStream.prototype, "readable", {
              configurable: !0,
              enumerable: !0,
              get: function() {
                  return this.source.readable
              }
          }), DelayedStream.prototype.setEncoding = function() {
              return this.source.setEncoding.apply(this.source, arguments)
          }, DelayedStream.prototype.resume = function() {
              this._released || this.release(), this.source.resume()
          }, DelayedStream.prototype.pause = function() {
              this.source.pause()
          }, DelayedStream.prototype.release = function() {
              this._released = !0, this._bufferedEvents.forEach(function(args) {
                  this.emit.apply(this, args)
              }.bind(this)), this._bufferedEvents = []
          }, DelayedStream.prototype.pipe = function() {
              var r = Stream.prototype.pipe.apply(this, arguments);
              return this.resume(), r
          }, DelayedStream.prototype._handleEmit = function(args) {
              this._released ? this.emit.apply(this, args) : ("data" === args[0] && (this.dataSize += args[1].length, this._checkIfMaxDataSizeExceeded()), this._bufferedEvents.push(args))
          }, DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
              if (!(this._maxDataSizeExceeded || this.dataSize <= this.maxDataSize)) {
                  this._maxDataSizeExceeded = !0;
                  var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
                  this.emit("error", new Error(message))
              }
          }
      }, {
          stream: void 0,
          util: void 0
      }],
      18: [function(require, module, exports) {
          var types = require("./types"),
              extname = require("path").extname,
              db = {};
          Object.keys(types).forEach(mime => {
              types[mime].forEach(extn => {
                  db[extn] = mime
              })
          }), module.exports = function(path) {
              if (!path || "string" != typeof path) return !1;
              var extension = extname("x." + path).toLowerCase().substr(1);
              return extension && db[extension] || !1
          }
      }, {
          "./types": 19,
          path: void 0
      }],
      19: [function(require, module, exports) {
          module.exports = {
              "application/andrew-inset": ["ez"],
              "application/applixware": ["aw"],
              "application/atom+xml": ["atom"],
              "application/atomcat+xml": ["atomcat"],
              "application/atomsvc+xml": ["atomsvc"],
              "application/bdoc": ["bdoc"],
              "application/ccxml+xml": ["ccxml"],
              "application/cdmi-capability": ["cdmia"],
              "application/cdmi-container": ["cdmic"],
              "application/cdmi-domain": ["cdmid"],
              "application/cdmi-object": ["cdmio"],
              "application/cdmi-queue": ["cdmiq"],
              "application/cu-seeme": ["cu"],
              "application/dash+xml": ["mpd"],
              "application/davmount+xml": ["davmount"],
              "application/docbook+xml": ["dbk"],
              "application/dssc+der": ["dssc"],
              "application/dssc+xml": ["xdssc"],
              "application/ecmascript": ["ecma"],
              "application/emma+xml": ["emma"],
              "application/epub+zip": ["epub"],
              "application/exi": ["exi"],
              "application/font-tdpfr": ["pfr"],
              "application/font-woff": ["woff"],
              "application/font-woff2": ["*woff2"],
              "application/geo+json": ["geojson"],
              "application/gml+xml": ["gml"],
              "application/gpx+xml": ["gpx"],
              "application/gxf": ["gxf"],
              "application/gzip": ["gz"],
              "application/hjson": ["hjson"],
              "application/hyperstudio": ["stk"],
              "application/inkml+xml": ["ink", "inkml"],
              "application/ipfix": ["ipfix"],
              "application/java-archive": ["jar", "war", "ear"],
              "application/java-serialized-object": ["ser"],
              "application/java-vm": ["class"],
              "application/javascript": ["js", "mjs"],
              "application/json": ["json", "map"],
              "application/json5": ["json5"],
              "application/jsonml+json": ["jsonml"],
              "application/ld+json": ["jsonld"],
              "application/lost+xml": ["lostxml"],
              "application/mac-binhex40": ["hqx"],
              "application/mac-compactpro": ["cpt"],
              "application/mads+xml": ["mads"],
              "application/manifest+json": ["webmanifest"],
              "application/marc": ["mrc"],
              "application/marcxml+xml": ["mrcx"],
              "application/mathematica": ["ma", "nb", "mb"],
              "application/mathml+xml": ["mathml"],
              "application/mbox": ["mbox"],
              "application/mediaservercontrol+xml": ["mscml"],
              "application/metalink+xml": ["metalink"],
              "application/metalink4+xml": ["meta4"],
              "application/mets+xml": ["mets"],
              "application/mods+xml": ["mods"],
              "application/mp21": ["m21", "mp21"],
              "application/mp4": ["mp4s", "m4p"],
              "application/msword": ["doc", "dot"],
              "application/mxf": ["mxf"],
              "application/octet-stream": ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"],
              "application/oda": ["oda"],
              "application/oebps-package+xml": ["opf"],
              "application/ogg": ["ogx"],
              "application/omdoc+xml": ["omdoc"],
              "application/onenote": ["onetoc", "onetoc2", "onetmp", "onepkg"],
              "application/oxps": ["oxps"],
              "application/patch-ops-error+xml": ["xer"],
              "application/pdf": ["pdf"],
              "application/pgp-encrypted": ["pgp"],
              "application/pgp-signature": ["asc", "sig"],
              "application/pics-rules": ["prf"],
              "application/pkcs10": ["p10"],
              "application/pkcs7-mime": ["p7m", "p7c"],
              "application/pkcs7-signature": ["p7s"],
              "application/pkcs8": ["p8"],
              "application/pkix-attr-cert": ["ac"],
              "application/pkix-cert": ["cer"],
              "application/pkix-crl": ["crl"],
              "application/pkix-pkipath": ["pkipath"],
              "application/pkixcmp": ["pki"],
              "application/pls+xml": ["pls"],
              "application/postscript": ["ai", "eps", "ps"],
              "application/pskc+xml": ["pskcxml"],
              "application/raml+yaml": ["raml"],
              "application/rdf+xml": ["rdf"],
              "application/reginfo+xml": ["rif"],
              "application/relax-ng-compact-syntax": ["rnc"],
              "application/resource-lists+xml": ["rl"],
              "application/resource-lists-diff+xml": ["rld"],
              "application/rls-services+xml": ["rs"],
              "application/rpki-ghostbusters": ["gbr"],
              "application/rpki-manifest": ["mft"],
              "application/rpki-roa": ["roa"],
              "application/rsd+xml": ["rsd"],
              "application/rss+xml": ["rss"],
              "application/rtf": ["rtf"],
              "application/sbml+xml": ["sbml"],
              "application/scvp-cv-request": ["scq"],
              "application/scvp-cv-response": ["scs"],
              "application/scvp-vp-request": ["spq"],
              "application/scvp-vp-response": ["spp"],
              "application/sdp": ["sdp"],
              "application/set-payment-initiation": ["setpay"],
              "application/set-registration-initiation": ["setreg"],
              "application/shf+xml": ["shf"],
              "application/smil+xml": ["smi", "smil"],
              "application/sparql-query": ["rq"],
              "application/sparql-results+xml": ["srx"],
              "application/srgs": ["gram"],
              "application/srgs+xml": ["grxml"],
              "application/sru+xml": ["sru"],
              "application/ssdl+xml": ["ssdl"],
              "application/ssml+xml": ["ssml"],
              "application/tei+xml": ["tei", "teicorpus"],
              "application/thraud+xml": ["tfi"],
              "application/timestamped-data": ["tsd"],
              "application/voicexml+xml": ["vxml"],
              "application/wasm": ["wasm"],
              "application/widget": ["wgt"],
              "application/winhlp": ["hlp"],
              "application/wsdl+xml": ["wsdl"],
              "application/wspolicy+xml": ["wspolicy"],
              "application/xaml+xml": ["xaml"],
              "application/xcap-diff+xml": ["xdf"],
              "application/xenc+xml": ["xenc"],
              "application/xhtml+xml": ["xhtml", "xht"],
              "application/xml": ["xml", "xsl", "xsd", "rng"],
              "application/xml-dtd": ["dtd"],
              "application/xop+xml": ["xop"],
              "application/xproc+xml": ["xpl"],
              "application/xslt+xml": ["xslt"],
              "application/xspf+xml": ["xspf"],
              "application/xv+xml": ["mxml", "xhvml", "xvml", "xvm"],
              "application/yang": ["yang"],
              "application/yin+xml": ["yin"],
              "application/zip": ["zip"],
              "audio/3gpp": ["*3gpp"],
              "audio/adpcm": ["adp"],
              "audio/basic": ["au", "snd"],
              "audio/midi": ["mid", "midi", "kar", "rmi"],
              "audio/mp3": ["*mp3"],
              "audio/mp4": ["m4a", "mp4a"],
              "audio/mpeg": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"],
              "audio/ogg": ["oga", "ogg", "spx"],
              "audio/s3m": ["s3m"],
              "audio/silk": ["sil"],
              "audio/wav": ["wav"],
              "audio/wave": ["*wav"],
              "audio/webm": ["weba"],
              "audio/xm": ["xm"],
              "font/collection": ["ttc"],
              "font/otf": ["otf"],
              "font/ttf": ["ttf"],
              "font/woff": ["*woff"],
              "font/woff2": ["woff2"],
              "image/apng": ["apng"],
              "image/bmp": ["bmp"],
              "image/cgm": ["cgm"],
              "image/g3fax": ["g3"],
              "image/gif": ["gif"],
              "image/ief": ["ief"],
              "image/jp2": ["jp2", "jpg2"],
              "image/jpeg": ["jpeg", "jpg", "jpe"],
              "image/jpm": ["jpm"],
              "image/jpx": ["jpx", "jpf"],
              "image/ktx": ["ktx"],
              "image/png": ["png"],
              "image/sgi": ["sgi"],
              "image/svg+xml": ["svg", "svgz"],
              "image/tiff": ["tiff", "tif"],
              "image/webp": ["webp"],
              "message/rfc822": ["eml", "mime"],
              "model/gltf+json": ["gltf"],
              "model/gltf-binary": ["glb"],
              "model/iges": ["igs", "iges"],
              "model/mesh": ["msh", "mesh", "silo"],
              "model/vrml": ["wrl", "vrml"],
              "model/x3d+binary": ["x3db", "x3dbz"],
              "model/x3d+vrml": ["x3dv", "x3dvz"],
              "model/x3d+xml": ["x3d", "x3dz"],
              "text/cache-manifest": ["appcache", "manifest"],
              "text/calendar": ["ics", "ifb"],
              "text/coffeescript": ["coffee", "litcoffee"],
              "text/css": ["css"],
              "text/csv": ["csv"],
              "text/html": ["html", "htm", "shtml"],
              "text/jade": ["jade"],
              "text/jsx": ["jsx"],
              "text/less": ["less"],
              "text/markdown": ["markdown", "md"],
              "text/mathml": ["mml"],
              "text/n3": ["n3"],
              "text/plain": ["txt", "text", "conf", "def", "list", "log", "in", "ini"],
              "text/richtext": ["rtx"],
              "text/rtf": ["*rtf"],
              "text/sgml": ["sgml", "sgm"],
              "text/shex": ["shex"],
              "text/slim": ["slim", "slm"],
              "text/stylus": ["stylus", "styl"],
              "text/tab-separated-values": ["tsv"],
              "text/troff": ["t", "tr", "roff", "man", "me", "ms"],
              "text/turtle": ["ttl"],
              "text/uri-list": ["uri", "uris", "urls"],
              "text/vcard": ["vcard"],
              "text/vtt": ["vtt"],
              "text/xml": ["*xml"],
              "text/yaml": ["yaml", "yml"],
              "video/3gpp": ["3gp", "3gpp"],
              "video/3gpp2": ["3g2"],
              "video/h261": ["h261"],
              "video/h263": ["h263"],
              "video/h264": ["h264"],
              "video/jpeg": ["jpgv"],
              "video/jpm": ["*jpm", "jpgm"],
              "video/mj2": ["mj2", "mjp2"],
              "video/mp2t": ["ts"],
              "video/mp4": ["mp4", "mp4v", "mpg4"],
              "video/mpeg": ["mpeg", "mpg", "mpe", "m1v", "m2v"],
              "video/ogg": ["ogv"],
              "video/quicktime": ["qt", "mov"],
              "video/webm": ["webm"]
          }
      }, {}]
  }, {}, [3])(3)
});

/***/ })
/******/ ]);