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
      self.searchOptions.error = res.data.msg || '没有相关varnish节点信息';
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
    data.statsStatus = 'loading';
    varnishService.stats(data.ip, data.port).then(function (res) {
      data.stats = JSON.stringify(res.data, null, 2);
      data.statsStatus = 'success';
    }, function (res) {
      data.statsStatus = 'error';
      data.error = res.data.msg;
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
    return $http.get('/varnish/stats/' + ip + '/' + port);
  }
}

})(this);
