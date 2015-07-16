;(function(global){
'use strict';

ctrl.$inject = ['$scope', '$http', 'util', 'debug', 'etcdService'];
service.$inject = ['$http', '$timeout'];


angular.module('jtApp').factory('etcdService', service);
angular.module('jtApp')
  .controller('EtcdPageController', ctrl);



function ctrl($scope, $http, util, debug, etcdService) {
  var self = this;
  self.data = etcdService.init();
  // 是否显示添加节点的面板功能
  self.nodeConf = {
    show : false
  };

  self.del = del;
  self.add = add;
  self.open = open;

  $scope.$watch('etcdPage.data.node', function() {
    self.nodeConf.status = '';
  }, true);
  return self;

  function open(node) {
    if (node.open) {
      return;
    }
    etcdService.get(node.key, node.dir).then(function (res) {
      var nodes = self.data.nodes;
      var index = _.indexOf(nodes, node);
      var arr = [index + 1, 0].concat(res.data);
      node.open = true;
      nodes.splice.apply(nodes, arr);
    }, function (res) {
      alert('加载失败：' + res.error);
    });
  }

  function del(node) {
    var str = node.key + ':' + node.value;
    util.alert('确定要删除该节点吗？', str).then(function() {
      node.status = 'doing';
      etcdService.del(node.key, node.dir).then(function(res) {
        var index = _.indexOf(self.data.nodes, node);
        self.data.nodes.splice(index, 1);
      }, function(res) {
        node.status = '';
        alert('删除失败：' + res.data);
      });
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
        self.nodeConf.error = res.data;
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
    var v = _.isUndefined(node.value)? '--' : JSON.stringify(node.value);
    return {
      key : node.key,
      value : v,
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
    var promise = $http.get(url);
    promise.then(function (res) {
      var data = res.data;
      if (_.isArray(data)) {
        res.data = _.map(res.data, convert);
      } else {
        res.data = convert(data);
      }
    });
    return promise;
  }

  /**
   * [del description]
   * @param  {[type]} key [description]
   * @param  {[type]} dir [description]
   * @return {[type]}     [description]
   */
  function del(key, dir) {
    var url = '/etcd/del?key=' + key;
    if (dir) {
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
    if (node.dir) {
      if (!node.key) {
        return {
          ok : false,
          msg : '创建dir，key不能为空'
        };
      }
    } else {
      if (!node.key || !node.value) {
        return {
          ok : false,
          msg : 'key, value不能为空'
        };
      }
    }
    return {
      ok : true
    };
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
