;(function(global){
'use strict';

ctrl.$inject = ['$scope', '$http', 'debug', 'etcdService'];
service.$inject = ['$http', '$timeout'];


angular.module('jtApp').factory('etcdService', service);
angular.module('jtApp')
  .controller('EtcdPageController', ctrl);



function ctrl($scope, $http, debug, etcdService) {
  var self = this;
  self.data = etcdService.init();


  self.del = function(node) {
    etcdService.del(node);
  };
  return self;
}

function service($http, $timeout) {
  var data = {};
  return {
    get : get,
    init : init,
    del : del
  };

  /**
   * [init description]
   * @return {[type]} [description]
   */
  function init() {
    var nodes = _.map(JT_GLOBAL.nodes, convert);
    nodes = _.sortBy(nodes, function(node) {
      return node.key;
    });
    data.nodes = nodes;
    $timeout(function() {
      data.status = 'success';
    });
    return data;
  }

  /**
   * [convert description]
   * @param  {[type]} node [description]
   * @return {[type]}      [description]
   */
  function convert(node) {
    var v = _.isUndefined(node.value)? '--' : node.value;
    return {
      key : node.key,
      value : _.isUndefined(node.value)? '--' : node.value,
      dir : !!node.dir,
      ttl : _.isUndefined(node.ttl)? '--' : node.ttl
    };
  }
  /**
   * [get description]
   * @param  {[type]} key [description]
   * @param  {[type]} dir [description]
   * @return {[type]}     [description]
   */
  function get(key, dir){
    var url = '/etcd/get?key=' + key;
    if (dir) {
      url += '&dir=1'
    }
    return $http.get(url);
  }

  /**
   * [del description]
   * @param  {[type]} argument [description]
   * @return {[type]}          [description]
   */
  function del(node) {
    node.status = 'doing';
    var url = '/etcd/del?key=' + node.key;
    return $http['delete'](url);
  }

}
})(this);
