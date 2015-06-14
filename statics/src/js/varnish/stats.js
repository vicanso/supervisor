;(function(global){
'use strict';
var fn = function($scope, $http, $element, $q, $timeout, debug, vs){
  debug = debug('jt.varnishStatsPage');
  var varnishList = JT_GLOBAL.varnishList;
  var statsDict = {};


  var self = this;

  // 指标统计相关信息
  self.statsConfig = {};
  self.statsList = null;
  self.init = false;

  self.quotaList = getQuotaList();

  self.start = start;

  $scope.$watch('varnishStats.statsConfig.interval', function(){
    self.statsConfig.status = '';
  });
  return self;

  function start(){
    var statsConfig = self.statsConfig;
    if(!statsConfig.interval){
      statsConfig.error = '时间间隔不能为空';
      statsConfig.status = 'error';
      return;
    }
    startMonitor(varnishList);
    self.init = true;
  }

  function getQuotaList(){
    var list = vs.quotaList();
    var defaultCheckedList = 'uptime sess_conn sess_drop sess_fail client_req cache_hit cache_hitpass cache_miss backend_conn backend_unhealthy backend_busy backend_fail backend_reuse backend_toolate backend_recycle backend_retry fetch_length fetch_chunked fetch_failed n_lru_nuked n_lru_moved backend_req';
    var result = [];
    angular.forEach(list, function(name){
      var checked = false;
      if(defaultCheckedList.indexOf(name) !== -1){
        checked = true;
      }
      result.push({
        name : name,
        checked : checked
      });
    });
    return result;
  }

  /**
   * [startMonitor description]
   * @param  {[type]} list [description]
   * @return {[type]}      [description]
   */
  function startMonitor(list){
    var interval = self.statsConfig.interval * 1000;
    vs.statsList(list).then(function(arr){
      angular.forEach(arr, function(res, i){
        var data = res.data;
        var name = list[i].name;
        var stats = statsDict[name];
        if(!stats){
          stats = [];
          statsDict[name] = stats;
        }
        if(data){
          stats.push(data);
        }
        if(stats.length > 11){
          stats.shift();
        }
      });
      self.statsList = covertStatsData(statsDict, [1, 2, 5, 10]);
      $timeout(function(){
        startMonitor(list);
      }, interval);
    }, function(){
      $timeout(function(){
        startMonitor(list);
      }, interval);
    });
  }

  function covertStatsData(dict, mergeList){
    var result = [];
    var keys = {};
    angular.forEach(self.quotaList, function(quota){
      if(quota.checked){
        keys[quota.name] = true;
      }
    });
    angular.forEach(dict, function(list, name){
      var stats = [];
      var last = list[list.length - 1];
      var tmp = {
        name : name,
        createdAt : last.createdAt,
        stats : stats
      };
      angular.forEach(last, function(v, k){
        if(k === 'createdAt' || !keys[k]){
          return;
        }
        var tmp = {
          name : k,
          v : v
        };
        angular.forEach(mergeList, function(i){
          if(list.length <= i){
            tmp[i] = '--';
          }else{
            tmp[i] = list[i][k] - list[0][k];
          }
        });
        stats.push(tmp);
      });
      result.push(tmp);
    });
    return result;
  }
};
fn.$inject = ['$scope', '$http', '$element', '$q', '$timeout', 'debug', 'varnishService'];
angular.module('jtApp')
  .controller('VarnishStatsController', fn);
})(this);