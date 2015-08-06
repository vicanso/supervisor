;(function(global){
'use strict';

ctrl.$inject = ['$scope', '$http', 'debug', 'varnishService'];
service.$inject = ['$http'];
varnishStatsDirective.$inject = ['$parse'];

var app = angular.module('jtApp');
app.factory('varnishService', service);
app.directive('varnishStats', varnishStatsDirective);
app.controller('VarnishPageController', ctrl);



function ctrl($scope, $http, debug, varnishService){
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

  self.searchOptions.keyword = 'haproxy-backends';
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
    if (data.statsStatus === 'loading') {
      return;
    } else if (data.statsStatus === 'success') {
      data.statsStatus = '';
      return;
    }
    data.statsStatus = 'loading';
    varnishService.stats(data.ip, data.port).then(function (res) {
      data.stats = res.data;
      data.statsStatus = 'success';
    }, function (res) {
      data.statsStatus = 'error';
      data.error = res.data.error;
    });
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
    var getter = $parse(attr.stats);
    var data = getter(scope);
    var result = [];
    var keys = 'cache fetch clientReq backend busy s sess n thread others vsm hcb shm sms bans esi'.split(' ');
    var htmlArrList = [];
    var statsCountList = [];
    for (var i = 0; i < 4; i++) {
      htmlArrList.push([]);
      statsCountList.push(0);
    }

    var getSmallestIndex = function(){
      var low = 99999;
      var index = 0;
      angular.forEach(statsCountList, function (count, i) {
        if (count < low) {
          low = count;
          index = i;
        }
      });
      return index;
    };

    angular.forEach(keys, function (k) {
      var v = data[k];
      var index = getSmallestIndex();
      var count = statsCountList[index] + 5;
      var arr = htmlArrList[index];
      arr.push('<div class="item"><div class="content">');
      arr.push('<div class="name"><span class="glyphicons glyphicons-stats"></span>' + k + '</div>');
      arr.push('<ul>')

      angular.forEach(v, function (v1, k1) {
        var html = '<li>' +
          '<span class="key">' + k1 + '</span>' +
          '<span class="value">' + v1 + '</span>' +
        '</li>';
        arr.push(html);
        count++
      });
      arr.push('</ul>');
      arr.push('</div></div>');
      statsCountList[index] = count;
    });
    var html = '';
    angular.forEach(htmlArrList, function (htmlArr) {
      html += ('<div class="col-xs-3">' + htmlArr.join('') + '</div>');
    });
    element.html(html);

    // resort();

    function resort() {
      var items = element.find('.item');
      var heightList = [];
      var result = [];
      angular.forEach(items, function (item) {
        item._height = angular.element(item).height();
        result.push(item);
      });
      result.sort(function(item1, item2){
        return item2._height - item1._height;
      });
      var heightList = [];
      var sortItems = [];
      for(var i = 0; i < 4; i++){
        heightList.push(0);
        sortItems.push([]);
      }

      angular.forEach(result, function(item) {
        var index = getLowest();
        sortItems[index].push(item);
        heightList[index] += item._height;
      });
      element.empty();
      angular.forEach(sortItems, function (items) {
        var obj = angular.element('<div class="col-xs-3"></div>');
        angular.forEach(items, function (item){
          delete item._height;
          obj.append(item);
        });
        element.append(obj);
      });
      element.css('visibility', 'visible');
    }
    // var arr = [];
    // var uptime;
    // angular.forEach(res.data, function (v, k) {
    //   if (k !== 'uptime') {
    //     var tmpArr = [];
    //     angular.forEach(v, function (v1, k1) {
    //       tmpArr.push({
    //         name : k1,
    //         value : v1
    //       });
    //     });
    //     arr.push({
    //       name : k,
    //       value : tmpArr
    //     });
    //   } else {
    //     uptime = v;
    //   }
    // });
  }

  return {
    restrict : 'E',
    link : link
  };
}

})(this);
