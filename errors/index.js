'use strict';
const debug = localRequire('helpers/debug');
const _ = require('lodash');
const requireTree = require('require-tree');

exports.get = getError;

/**
 * [getError description]
 * @param  {[type]} msg [description]
 * @param  {[type]} code [description]
 * @return {[type]}     [description]
 */
function getError(msg, code) {
  let err = new Error(msg);
  err.code = code || 500;
  err.expose = true;
  return err;
}
