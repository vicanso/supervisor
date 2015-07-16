'use strict';
const _ = require('lodash');
const moment = require('moment');
const config = require('../config');
const urlJoin = require('url-join');
const path = require('path');
const crc32Infos = require('../crc32.json');
const pm2Json = require('../pm2.json');
const globals = require('../globals');
module.exports = function() {
  let appUrlPrefix = globals.get('config.appUrlPrefix') || '';
  let staticUrlPrefix = globals.get('config.staticUrlPrefix');
  let imgUrlFn = getImgUrl(staticUrlPrefix);
  let anchorUrlFn = function(url) {
    return urlJoin(appUrlPrefix, url);
  };
  return function *(next) {
    /*jshint validthis:true */
    let ctx = this;
    let state = ctx.state;
    state.STATIC_URL_PREFIX = staticUrlPrefix || '';
    state.APP_URL_PREFIX = appUrlPrefix || '';
    state.ENV = config.env;
    state._ = _;
    state.moment = moment;
    state.IMG_URL = imgUrlFn;
    state.URL = anchorUrlFn;
    yield* next;
  };
};


/**
 * [getImgUrl description]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
function getImgUrl(staticUrlPrefix) {
  return function(file) {
    if (config.env === 'development') {
      return urlJoin(staticUrlPrefix, file, '?v=' + Date.now());
    } else {
      let version = crc32Infos[file];
      if (version) {
        let ext = path.extname(file);
        file = file.replace(ext, '.' + version + ext);
      } else {
        file = file + '?v=' + pm2Json.env.APP_VERSION;
      }
      return urlJoin(staticUrlPrefix, file);
    }
  };
}
