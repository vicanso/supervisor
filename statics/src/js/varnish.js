;(function(global){
'use strict';

ctrl.$inject = ['$scope', '$http', '$timeout', 'debug', 'varnishService'];
service.$inject = ['$http'];
varnishStatsDirective.$inject = ['$parse'];

var app = angular.module('jtApp');
app.factory('varnishService', service);
app.directive('varnishStats', varnishStatsDirective);
app.controller('VarnishPageController', ctrl);



function ctrl($scope, $http, $timeout, debug, varnishService){
  /*jshint validthis:true */
  var self = this;
  debug = debug('jt.varnish');

  self.viewVcl = {
    mode : 'normal',
    value : ''
  };

  self.searchOptions = {
    status : ''
  };

  $scope.$watch('varnishPage.searchOptions.keyword', function () {
    self.searchOptions.status = '';
  });

  self.search = search;
  self.fullScreen = fullScreen;
  self.showStats = showStats;
  self.toggleTimingRefresh = toggleTimingRefresh;

  // self.searchOptions.keyword = 'haproxy-backends';

  $timeout(function (argument) {
    search('haproxy-backends')
  }, 100);

  $timeout(function (argument) {
    var node = self.searchOptions.nodes[0];
    showStats(node);
    $timeout(function (){
      toggleTimingRefresh(node);
    }, 1000);
  }, 1000);

  return self;
  /**
   * [search description]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  function search(key) {
    debug('search:%s', key);
    if (!key) {
      self.searchOptions.status = 'warning';
      return;
    }
    if (self.searchOptions.status === 'loading') {
      return;
    }
    if (key.charAt(0) !== '/') {
      key = '/' + key;
    }
    self.searchOptions.status = 'loading';
    varnishService.list(key).then(function (res) {
      self.searchOptions.status = 'success';
      self.searchOptions.nodes = res.data;
    }, function (res) {
      self.searchOptions.status = 'error';
      self.searchOptions.error = res.data.error || '没有相关varnish节点信息';
    });
  }


  /**
   * [fullScreen 全屏]
   * @param  {[type]} vcl [description]
   * @return {[type]}     [description]
   */
  function fullScreen(vcl) {
    var viewVcl = self.viewVcl;
    viewVcl.mode = 'full';
    viewVcl.value = vcl;
  }


  /**
   * [showStats description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  function showStats(data) {
    if (data.timer) {
      $timeout.cancel(data.timer);
      data.timer = null;
    }
    if (data.statsStatus === 'loading') {
      return;
    } else if (data.statsStatus === 'success') {
      data.statsStatus = '';
      return;
    }
    data.statsStatus = 'loading';
    varnishService.stats(data.ip, data.port).then(function (res) {
      data.stats = res.data;
      data.statsStatus = 'table';
    }, function (res) {
      data.statsStatus = 'error';
      data.error = res.data.error;
    });
  }

  function toggleTimingRefresh(data) {
    var interval = 10 * 1000;
    if (data.timer) {
      $timeout.cancel(data.timer);
      data.timer = null;
    } else {
      var fn = function () {
        varnishService.stats(data.ip, data.port).then(function (res) {
          data.stats = res.data;
          data.timer = $timeout(fn, interval);
        }, function (res) {
          data.timer = $timeout(fn, interval);
        });
      };
      data.timer = $timeout(fn, interval);
    }
  }
}


function service($http) {
  return {
    list : list,
    stats : stats
  };


  /**
   * [list 列出varnish信息]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  function list(key) {
    return $http.get('/varnish/list?key=' + key);
  }

  function stats(ip, port) {
    var promise = $http.get('/varnish/stats/' + ip + '/' + port);
    return promise;
  }
}


function varnishStatsDirective($parse) {
  function link(scope, element, attr) {
    var statsDataList = [];
    var indexList = [1, 2, 6, 12, 30];

    /**
     * [arrangeData description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    function arrangeData(data) {
      var keys = 'cache fetch clientReq backend busy s sess n thread others vsm hcb shm sms bans esi'.split(' ');
      statsDataList.unshift(data);
      if (statsDataList.length > 30) {
        statsDataList.pop();
      }
      var result = {};
      var getValue = function (k1, k2, index) {
        var length = statsDataList.length;
        if (index >= length) {
          return '--';
        }
        return statsDataList[0][k1][k2] - statsDataList[index][k1][k2];
      };
      angular.forEach(keys, function (key) {
        angular.forEach(data[key], function (v, k) {
          if (!v) {
            return;
          }
          var arr = [];
          result[key + '.' + k] = arr;
          angular.forEach(indexList, function (index) {
            arr.push(getValue(key, k, index));
          });
          arr.push(v);
        });
      });
      return result;
    }

    /**
     * [appendStatsHtml description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    function appendStatsHtml(data) {
      var theadHtml = '<thead><th>#</th>';
      angular.forEach(indexList, function (index) {
        theadHtml += ('<th>' + (index * 10) + '</th>');
      });
      theadHtml += '<th>latest</th>';
      theadHtml += '</thead>';
      var htmlArr = ['<table class="table">' +
        theadHtml +
        '<tbody>'
      ];
      angular.forEach(data, function (arr, k) {
        htmlArr.push('<tr><td>' + k + '</td>');
        angular.forEach(arr, function function_name(v) {
          htmlArr.push('<td>' + v + '</td>');
        });
        htmlArr.push('</tr>');
      });
      htmlArr.push('</tbody></table>');
      element.html(htmlArr.join(''));
    }


    scope.$watch(attr.stats, function (v) {
      if (v) {
        appendStatsHtml(arrangeData(v));
      }
    });
  }

  return {
    restrict : 'E',
    link : link
  };
}

})(this);
