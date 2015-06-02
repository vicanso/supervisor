'use strict';
var _ = require('lodash');
var moment = require('moment');
var path = require('path');
var fs = require('fs');
var config = require('../config');
var crc32Infos = require('../crc32');
var defaultVersion = fs.readFileSync(path.join(__dirname, '../version'), 'utf8');
/**
 * [exports 添加常量或者一些工具方法到state中]
 * @return {[type]} [description]
 */
module.exports = function(){
  return function *(next){
    var state = this.state;
    state.STATIC_URL_PREFIX = config.staticUrlPrefix;
    state.APP_URL_PREFIX = config.appUrlPrefix;
    state.ENV = config.env;
    state._ = _;
    state.moment = moment;
    //用于对图片文件生成版本号
    state.TAG = function(file){
      var url = path.join(config.staticUrlPrefix, file);
      var tag = crc32Infos[file] || defaultVersion;
      return url + '?v=' + tag;
    };
    yield* next;
  };
}