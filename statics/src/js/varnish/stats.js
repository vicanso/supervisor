;(function(global){
'use strict';
var fn = function($scope, $http, $element, $q, $timeout, debug, vs){
  debug = debug('jt.varnishStatsPage');
  var varnishList = JT_GLOBAL.varnishList;
  var interval = 60 * 1000;
  var statsList = {};


  var self = this;
  self.statsList = null;
  self.init = false;

  self.quotaList = vs.quotaList();


  // startMonitor(varnishList);
  return self;


  function startMonitor(list){
    vs.statsList(list).then(function(arr){
      angular.forEach(arr, function(res, i){
        var data = res.data;
        var name = list[i].name;
        var stats = statsList[name];
        if(!stats){
          stats = {};
          statsList[name] = stats;
        }
        if(stats.createdAt === data.createdAt){
          return;
        }
        stats.createdAt = data.createdAt;
        angular.forEach(data.items, function(item, j){
          var name = item.name;
          var tmp = stats[name];
          if(!tmp){
            tmp = {
              changes : []
            };
            stats[name] = tmp;
          }
          tmp.v = item.v;
          var changes = tmp.changes;
          changes.unshift(item.c);
          if(changes.length > 10){
            changes.pop();
          }
        });
      });
      self.statsList = covertStatsData(statsList, [1, 2, 5, 10]);
      $timeout(function(){
        startMonitor(list);
      }, interval);
    }, function(){
      $timeout(function(){
        startMonitor(list);
      }, interval);
    });
  }

  function covertStatsData(list, mergeList){
    var result = [];

    angular.forEach(list, function(data, name){
      var stats = [];
      var tmp = {
        name : name,
        createdAt : data.createdAt,
        stats : stats
      };
      delete data.createdAt;
      angular.forEach(data, function(data, k){
        var tmp = {
          name : k,
          v : data.v
        };
        angular.forEach(mergeList, function(i){
          var v = sum(data.changes, i);
          if(angular.isUndefined(v)){
            v = '--';
          }
          tmp[i] = v;
        });
        stats.push(tmp);
      });
      result.push(tmp);
    });
    return result;
    // 计算前几个数的总和
    function sum(arr, total){
      if(arr.length < total){
        return;
      }
      var tmp = 0;
      for(var i = 0; i < total; i++){
        tmp += arr[i];
      }
      return tmp;
    }
  }
};
fn.$inject = ['$scope', '$http', '$element', '$q', '$timeout', 'debug', 'varnishService'];
angular.module('jtApp')
  .controller('VarnishStatsController', fn);
})(this);