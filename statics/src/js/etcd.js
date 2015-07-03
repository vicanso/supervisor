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
  // 是否显示添加节点的面板功能
  self.nodeConf = {
    show : false
  };

  self.del = del;
  self.add = add;

  $scope.$watch('etcdPage.data.node', function() {
    self.nodeConf.status = '';
  }, true);
  return self;


  function del(node) {
    node.status = 'doing';
    etcdService.del(node).then(function(res) {
      var index = _.indexOf(self.data.nodes, node);
      self.data.nodes.splice(index, 1);
    }, function(res) {
      node.status = '';
      alert('删除失败：' + res.error);
    });
  }

  function add() {
    if (self.nodeConf.status === 'submitting') {
      return;
    }
    var result = etcdService.validate(self.data.node);
    if (result.ok) {
      self.nodeConf.status = 'submitting';
      etcdService.add(self.data.node).then(function(res) {
        self.nodeConf.status = 'success';
        setTimeout(function() {
          location.reload();
        }, 2000);
      }, function(res) {
        self.nodeConf.status = 'error';
        self.nodeConf.error = res.error;
      });
    } else {
      self.nodeConf.status = 'error';
      self.nodeConf.error = result.msg;
    }
  }
}

function service($http, $timeout) {
  var data = {
    // 当前的etcd nodes
    nodes : null,
    // 用于保存要添加的节点数据
    node : {}
  };
  return {
    get : get,
    init : init,
    del : del,
    add : add,
    validate : validate
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
    var url = '/etcd/del?key=' + node.key;
    if (node.dir) {
      url += '&dir=1';
    }
    return $http['delete'](url);
  }

  /**
   * [validate description]
   * @param  {[type]} node [description]
   * @return {[type]}      [description]
   */
  function validate(node) {
    if(!node || !node.key || !node.value) {
      return {
        ok : false,
        msg : 'key, value不能为空'
      };
    } else {
      return {
        ok : true
      };
    }
  }


  /**
   * [add description]
   * @param {[type]} node [description]
   */
  function add(node) {
    return $http.post('/etcd/add', node);
  }

}
})(this);
