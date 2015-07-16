/*!
 * 全局公用的常量
 */
;(function(global){
'use strict';
var module = angular.module('jt.service.const', []);
// 常量
var CONST = angular.extend({
  app : 'timtam'
}, CONFIG);
module.constant('CONST', CONST);
})(this);