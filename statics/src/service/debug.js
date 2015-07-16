/*!
 * debug输出模块
 * @return {[type]} [description]
 */
;(function(global){
'use strict';
var module = angular.module('jt.service.debug', []);
function noop(){}
function debugFn(CONST){
  var debug = window.debug;
  if(debug){
    var pattern = CONST.pattern;
    if(pattern){
      debug.enable(pattern);
    }else{
      debug.disable();
    }
    return debug;
  }else{
    return function(){
      return noop;
    };
  }
}
debugFn.$inject = ['CONST'];
module.factory('debug', debugFn);
})(this);
