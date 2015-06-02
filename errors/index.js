'use strict';
var _ = require('lodash');
var requireTree = require('require-tree');
var errors = requireTree('./');
exports.get = getError;

/**
 * [getError 根据code返回error对象]
 * @param  {[type]} code [description]
 * @return {[type]}      [description]
 */
function getError(code, language){
  language = language || 'en';
  // 1 - 200 system error
  var errorInfo = null;
  _.forEach(errors, function(tmp){
    if(!errorInfo && tmp[code]){
      errorInfo = tmp[code];
    }
  })
  var msg;
  if(!errorInfo){
    msg = 'the error code is undefined';
  }else{
    msg = errorInfo[language];
  }
  var err = new Error(msg);
  err.code = code;
  err.data = {
    code : code,
    msg : msg
  };
  return err;
  
}