'use strict';
const _ = require('lodash');
let globals = {
  // 是否重启，如果设置为true，/ping则返回error
  restart: false,
  // 当前连接数
  connectingTotal: 0,
  performance: {}
};
exports.get = get;
exports.set = set;

/**
 * [get description]
 * @param  {[type]} k [description]
 * @return {[type]}   [description]
 */
function get(k) {
  if (k) {
    return _.get(globals, k);
  }
}

/**
 * [set description]
 * @param {[type]} k [description]
 * @param {[type]} v [description]
 */
function set(k, v) {
  if (k) {
    _.set(globals, k, v);
  }
}
