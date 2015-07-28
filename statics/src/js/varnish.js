;(function(global){
'use strict';

ctrl.$inject = ['$scope', '$http', 'debug', 'varnishService'];

service.$inject = ['$http'];

angular.module('jtApp').factory('varnishService', service);

angular.module('jtApp')
  .controller('VarnishPageController', ctrl);

function service($http) {
  return {
    list : list
  };


  function list(key) {
    return $http.get('/varnish/list?key=' + key);
  }
}

function ctrl($scope, $http, debug, varnishService){
  /*jshint validthis:true */
  var self = this;
  debug = debug('jt.varnish');

  self.searchOptions = {
    status : ''
  };

  $scope.$watch('varnishPage.searchOptions.keyword', function () {
    self.searchOptions.status = '';
  });

  self.search = search;
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
      var nodes = res.data;
      angular.forEach(nodes, function (node) {
        node.value = JSON.stringify(node.value);
      });
      self.searchOptions.nodes = nodes;
    }, function (res) {
      self.searchOptions.status = 'error';
      self.searchOptions.error = res.data.msg;
    });
  }
}


})(this);
