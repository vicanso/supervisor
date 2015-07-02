'use strict';
const debug = require('../helpers/debug');
const _ = require('lodash');
const requireTree = require('require-tree');
const errors = getAllErrors();

exports.get = getError;

/**
 * [getError 根据code返回error对象]
 * @param  {[type]} code     [description]
 * @param  {[type]} language [description]
 * @param  {[type]} data [description]
 * @return {[type]}          [description]
 */
function getError(code, language, data) {
  if (_.isObject(language)) {
    data = language;
    language = '';
  }
  language = language || 'en';
  let errorInfo = errors[code];
  let msg = '';
  if (!errorInfo) {
    msg = 'the error code is undefined';
  } else {
    msg = errorInfo[language];
  }
  if (data) {
    msg = _.template(msg)(data);
  }
  let err = new Error(msg);
  err.code = code;
  return err;
}


/**
 * [getAllErrors 将error整理到一个Object中]
 * @return {[type]} [description]
 */
function getAllErrors() {
  let result = {};
  _.forEach(_.values(requireTree('./')), function(tmp) {
    _.forEach(tmp, function(errorInfo, code) {
      if (result[code]) {
        console.error('code %s is duplicate', code);
      }
      result[code] = errorInfo;
    });
  });
  debug('errors:%j', result);
  return result;
}
