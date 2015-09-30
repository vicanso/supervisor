'use strict';
const _ = require('lodash');

var globals = {
  // running, pause
  status: 'running',
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
