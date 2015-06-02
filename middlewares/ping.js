'use strict';
var fs = require('fs');
var path = require('path');
var version = fs.readFileSync(path.join(__dirname, '../version'), 'utf8');
/**
 * [exports 响应ping请求]
 * @param  {[type]} url [description]
 * @return {[type]}     [description]
 */
module.exports = function(url){
  return function *(next){
    if(this.request.url === url){
      this.body = version;
    }else{
      yield* next;
    }
  };
};