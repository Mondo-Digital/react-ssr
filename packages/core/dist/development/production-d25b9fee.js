'use strict';

var helpers = require('./helpers-7a10276b.js');
var register = require('./register-d5338d0c.js');
var fs = require('fs');
var fse = require('fs-extra');
var MemoryFileSystem = require('memory-fs');
var path = require('path');
var webpack = require('webpack');
require('webpack-merge');
require('mini-css-extract-plugin');
require('optimize-css-assets-webpack-plugin');
require('terser-webpack-plugin');
require('slash');
require('react');
require('lz-string');
require('urlsafe-base64');
require('recursive-readdir');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var fse__default = /*#__PURE__*/_interopDefaultLegacy(fse);
var MemoryFileSystem__default = /*#__PURE__*/_interopDefaultLegacy(MemoryFileSystem);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var webpack__default = /*#__PURE__*/_interopDefaultLegacy(webpack);

var cwd = process.cwd();

var ufs = require('unionfs').ufs;

var memfs = new MemoryFileSystem__default["default"]();
ufs.use(fs__default["default"]).use(memfs);

var _registerExpressRoutes = function _registerExpressRoutes(app, entryPages) {
  var _loop = function _loop(i) {
    var page = entryPages[i];
    var pageId = register.getPageId(page, '_');
    app.use("/_react-ssr/".concat(pageId, ".css"), function (req, res) {
      var filename = path__default["default"].join(cwd, register.ssrConfig.distDir, "".concat(pageId, ".css"));
      var style = register.existsSync(filename) ? fs__default["default"].readFileSync(filename).toString() : '';
      res.writeHead(200, {
        'Content-Type': 'text/css'
      });
      res.end(style, 'utf-8');
    });
    app.use("/_react-ssr/".concat(pageId, ".js"), function (req, res) {
      var filename = path__default["default"].join(cwd, register.ssrConfig.distDir, "".concat(pageId, ".js"));
      var script = fs__default["default"].readFileSync(filename).toString();
      res.status(200).type('.js').send(script);
    });
  };

  for (var i = 0; i < entryPages.length; i++) {
    _loop(i);
  }
};

var production = /*#__PURE__*/(function () {
  var _ref = register._asyncToGenerator( /*#__PURE__*/register.regenerator.mark(function _callee(app) {
    var _yield$getEntry, _yield$getEntry2, entry, entryPages, webpackConfig, compiler;

    return register.regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return helpers.getEntry(memfs);

          case 2:
            _yield$getEntry = _context.sent;
            _yield$getEntry2 = helpers._slicedToArray(_yield$getEntry, 2);
            entry = _yield$getEntry2[0];
            entryPages = _yield$getEntry2[1];

            if (!(register.ssrConfig.usePreCompiled && !register.existsSync(path__default["default"].join(cwd, register.ssrConfig.distDir)))) {
              _context.next = 10;
              break;
            }

            throw new Error("Build dir not found and `usePreCompiled` is set to `true`.");

          case 10:
            if (!(register.ssrConfig.usePreCompiled && register.existsSync(path__default["default"].join(cwd, register.ssrConfig.distDir)))) {
              _context.next = 14;
              break;
            }

            _registerExpressRoutes(app, entryPages);

            _context.next = 21;
            break;

          case 14:
            if (register.ssrConfig.usePreCompiled) {
              _context.next = 21;
              break;
            }

            fse__default["default"].removeSync(path__default["default"].join(cwd, register.ssrConfig.distDir));
            webpackConfig = helpers.configureWebpack(entry);
            compiler = webpack__default["default"](webpackConfig);
            compiler.inputFileSystem = ufs;
            _context.next = 21;
            return new helpers._Promise(function (resolve, reject) {
              compiler.run(function (err, stats) {
                err && reject(err.stack || err);
                stats.hasErrors() && reject(stats.toString());

                _registerExpressRoutes(app, entryPages);

                resolve();
              });
            });

          case 21:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();

exports["default"] = production;
