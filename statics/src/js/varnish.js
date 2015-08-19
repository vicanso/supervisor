;(function(global){
'use strict';

ctrl.$inject = ['$scope', '$http', 'debug', 'varnishService'];
service.$inject = ['$http'];

var app = angular.module('jtApp');
app.factory('varnishService', service);
app.directive('varnishStats', directive);
app.controller('VarnishPageController', ctrl);

function ctrl($scope, $http, debug, varnishService) {
  /*jshint validthis:true */
  var self = this;
  varnishService.stats('172.17.0.13', 80).then(function (res) {
    console.dir(res);
  });
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


function directive(argument) {
  function link(scope, element, attr) {

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
      var htmlArr = ['<table class="table">' +
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
