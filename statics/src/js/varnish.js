;(function(global){
'use strict';

ctrl.$inject = ['$scope', '$http', '$timeout', 'debug', 'varnishService'];
service.$inject = ['$http'];

var app = angular.module('jtApp');
app.factory('varnishService', service);
app.directive('varnishStats', directive);
app.controller('VarnishPageController', ctrl);

function ctrl($scope, $http, $timeout, debug, varnishService) {
  /*jshint validthis:true */
  var self = this;

  self.stats = {
    show : false,
    status : '',
    timer : null
  };

  self.showStats = showStats;


  /**
   * [showStats description]
   * @param  {[type]} ip   [description]
   * @param  {[type]} port [description]
   * @return {[type]}      [description]
   */
  function showStats(ip, port) {
    self.stats.show = true;
    self.stats.status = 'loading';
    var interval = 10 * 1000;
    var fn = function () {
      varnishService.stats(ip, port).then(function (res) {
        self.stats.status = 'success';
        self.stats.data = res.data;
        self.stats.timer = $timeout(fn, interval);
      }, function (res) {
        self.stats.timer = $timeout(fn, interval);
      });
    };
    fn();
  }

  return self;
}


function service($http) {
  return {
    stats : stats
  };


  /**
   * [stats description]
   * @param  {[type]} ip   [description]
   * @param  {[type]} port [description]
   * @return {[type]}      [description]
   */
  function stats(ip, port) {
    var promise = $http.get('/varnish/stats/' + ip + '/' + port);
    return promise;
  }
}


function directive() {
  function link(scope, element, attr) {
    var statsDataList = [];
    var indexList = [1, 2, 6, 12, 30];
    scope.$watch(attr.stats, function(v) {
      if (v) {
        appendStatsHtml(arrangeData(v));
      }
    });


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
      var getValue = function(k1, k2, index) {
        var length = statsDataList.length;
        if (index >= length) {
          return '--';
        }
        return statsDataList[0][k1][k2] - statsDataList[index][k1][k2];
      };
      angular.forEach(keys, function(key) {
        angular.forEach(data[key], function(v, k) {
          if (!v) {
            return;
          }
          var arr = [];
          result[key + '.' + k] = arr;
          angular.forEach(indexList, function(index) {
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
      angular.forEach(indexList, function(index) {
        theadHtml += ('<th>' + (index * 10) + '</th>');
      });
      theadHtml += '<th>latest</th>';
      theadHtml += '</thead>';
      var htmlArr = ['<table class="pure-table pure-table-bordered">' +
        theadHtml +
        '<tbody>'
      ];
      angular.forEach(data, function(arr, k) {
        htmlArr.push('<tr><td>' + k + '</td>');
        angular.forEach(arr, function function_name(v) {
          htmlArr.push('<td>' + v + '</td>');
        });
        htmlArr.push('</tr>');
      });
      htmlArr.push('</tbody></table>');
      element.html(htmlArr.join(''));
    }
  }

  return {
    restrict : 'E',
    link : link
  };
}

})(this);
