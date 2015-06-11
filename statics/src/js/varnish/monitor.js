;(function(global){
'use strict';
var fn = function($scope, $http, $element, $q, $timeout, debug, vs){
  var self = this;
  debug = debug('jt.varnishMonitorPage');
  var varnishList = JT_GLOBAL.varnishList;
  var interval = 60 * 1000;

  self.statsList = [];
  self.changeDict = [];

  startMonitor(varnishList);
  return self;


  function startMonitor(list){
    vs.statsList(list).then(function(arr){
      angular.forEach(arr, function(res, i){
        var data = res.data;
        var changes = self.changesList[i];
        if(!changes)
        angular.forEach(data.items, function(item, j){

        });
      });
      $timeout(function(){
        startMonitor(list);
      }, interval);
    }, function(){
      $timeout(function(){
        startMonitor(list);
      }, interval);
    });
  }
};
fn.$inject = ['$scope', '$http', '$element', '$q', '$timeout', 'debug', 'varnishService'];
angular.module('jtApp')
  .controller('VarnishMonitorController', fn);
})(this);