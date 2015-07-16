'use strict';
const _ = require('lodash');
let globals = {};
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
