'use strict';
const _ = require('lodash');
const moment = require('moment');
const config = require('../config');
const urlJoin = require('url-join');
const path = require('path');
const crc32Infos = require('../crc32.json');
const pm2Json = require('../pm2.json');
module.exports = function() {
  return function *(next) {
    /*jshint validthis:true */
    let ctx = this;
    let state = ctx.state;
    state.STATIC_URL_PREFIX = config.staticUrlPrefix;
    state.APP_URL_PREFIX = config.appUrlPrefix;
    state.ENV = config.env;
    state._ = _;
    state.moment = moment;
    state.IMG_URL = getImgUrl;
    state.URL = getAnchorUrl;
    yield* next;
  };
};


/**
 * [getImgUrl description]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
function getImgUrl(file) {
  if (config.env === 'development') {
    return urlJoin(config.staticUrlPrefix, file, '?v=' + Date.now());
  } else {
    let version = crc32Infos[file];
    if (version) {
      let ext = path.extname(file);
      file = file.replace(ext, '.' + version + ext);
    } else {
      file = file + '?v=' + pm2Json.env.APP_VERSION;
    }
    return urlJoin(config.staticUrlPrefix, file);
  }
}


/**
 * [getAnchorUrl description]
 * @param  {[type]} url [description]
 * @return {[type]}     [description]
 */
function getAnchorUrl(url) {
  return urlJoin(config.appUrlPrefix, url);
}
