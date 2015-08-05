;(function(global){
'use strict';

ctrl.$inject = ['$scope', '$http', 'debug', 'varnishService'];

service.$inject = ['$http'];

angular.module('jtApp').factory('varnishService', service);

angular.module('jtApp')
  .controller('VarnishPageController', ctrl);



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
      var arr = [];
      var uptime;
      angular.forEach(res.data, function (v, k) {
        if (k !== 'uptime') {
          var tmpArr = [];
          angular.forEach(v, function (v1, k1) {
            tmpArr.push({
              name : k1,
              value : v1
            });
          });
          arr.push({
            name : k,
            value : tmpArr
          });
        } else {
          uptime = v;
        }
      });
      data.stats = {
        list : arr,
        uptime : uptime
      };
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
    // var keys = {
    //   sess : 'sess_conn sess_drop sess_fail sess_pipe_overflow',
    //   client_req : 'client_req_400 client_req_411 client_req_413 client_req_417 client_req',
    //   cache : 'cache_hit cache_hitpass cache_miss',
    //   backend : 'backend_conn backend_unhealthy backend_busy backend_fail backend_reuse backend_toolate backend_recycle backend_retry',
    //   fetch : 'fetch_head fetch_length '
    // }
    promise.then(function (res) {
      var data = res.data;
      console.dir(data);
    });
    return promise;
  }
}

})(this);
