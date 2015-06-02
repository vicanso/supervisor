'use strict';
var url = require('url');
var querystring = require('querystring');
var _ = require('lodash');
var debug = require('../helpers/debug');

module.exports = function(checkQuery){
  debug('query checker conditions:%s', checkQuery);
  var arr = checkQuery.split('&');
  var checkParams = {};
  _.forEach(arr, function(str){
    var tmpArr = str.split('=');
    checkParams[tmpArr[0]] = tmpArr[1];
  });
  return function *(next){
    var query = this.query;
    var valid = true;
    _.forEach(checkParams, function(v, k){
      if(valid && query[k] !== v){
        valid = false;
      }
    });
    if(valid){
      yield *next;
    }else{
      var originalUrl = this.request.originalUrl;
      var urlInfo = url.parse(originalUrl);
      console.info('query checker:%s, url:%s', checkQuery, originalUrl);
      _.extend(query, checkParams);
      this.status = 302;
      this.redirect(urlInfo.pathname + '?' + querystring.stringify(query));
    }
  };
};