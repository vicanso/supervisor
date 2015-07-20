;(function(global){
'use strict';

ctrl.$inject = ['$scope', '$http', 'util', 'debug', 'etcdService'];
service.$inject = ['$http', '$timeout'];

angular.module('jtApp').directive('jtCodeMirror', jtCodeMirror);

angular.module('jtApp').factory('etcdService', service);
angular.module('jtApp')
  .controller('EtcdPageController', ctrl);



function ctrl($scope, $http, util, debug, etcdService) {
  /*jshint validthis:true */
  var self = this;
  self.data = etcdService.init();
  self.show = show;
  self.showPath = showPath;
  self.modify = modify;

  return self;

  /**
   * [show description]
   * @param  {[type]} node [description]
   * @return {[type]}     [description]
   */
  function show(node) {
    etcdService.show(node.key);
  }

  /**
   * [showPath description]
   * @param  {[type]} index [description]
   * @return {[type]}       [description]
   */
  function showPath(index) {
    var keyArr = [];
    angular.forEach(self.data.paths, function (path, i) {
      if (i && i <= index) {
        keyArr.push(path);
      }
    });
    etcdService.show('/' + keyArr.join(''));
  }

  /**
   * [modify description]
   * @param  {[type]} node [description]
   * @return {[type]}      [description]
   */
  function modify(node) {
    node.modifing = true;
  }

  // // 是否显示添加节点的面板功能
  // self.nodeConf = {
  //   show : false
  // };
  //
  // self.del = del;
  // self.add = add;
  // self.open = open;
  //
  // $scope.$watch('etcdPage.data.node', function() {
  //   self.nodeConf.status = '';
  // }, true);
  // return self;
  //
  // function open(node) {
  //   if (node.open) {
  //     return;
  //   }
  //   etcdService.get(node.key, node.dir).then(function (res) {
  //     var nodes = self.data.nodes;
  //     var index = _.indexOf(nodes, node);
  //     var arr = [index + 1, 0].concat(res.data);
  //     node.open = true;
  //     nodes.splice.apply(nodes, arr);
  //   }, function (res) {
  //     alert('加载失败：' + res.error);
  //   });
  // }
  //
  // function del(node) {
  //   util.alert('确定要删除该节点吗？', 'abcd').then(function() {
  //     console.dir('del');
  //   });
  // }
  //
  // function add() {
  //   if (self.nodeConf.status === 'submitting') {
  //     return;
  //   }
  //   var result = etcdService.validate(self.data.node);
  //   if (result.ok) {
  //     self.nodeConf.status = 'submitting';
  //     etcdService.add(self.data.node).then(function(res) {
  //       self.nodeConf.status = 'success';
  //       setTimeout(function() {
  //         location.reload();
  //       }, 2000);
  //     }, function(res) {
  //       self.nodeConf.status = 'error';
  //       self.nodeConf.error = res.data;
  //     });
  //   } else {
  //     self.nodeConf.status = 'error';
  //     self.nodeConf.error = result.msg;
  //   }
  // }
}

function service($http, $timeout) {
  var etcdData = {
    status : 'loading',
    nodes : {},
    paths : [],
    currentPath : ''
  };
  return {
    init : init,
    show : show
  };

  /**
   * [init description]
   * @return {[type]} [description]
   */
  function init() {
    etcdData.status = 'loading';
    list().then(function (res) {
      var key = '/';
      etcdData.currentPath = key;
      etcdData.nodes[key] = res.data;
      etcdData.paths = getPaths(key);
      etcdData.status = 'success';
    }, function (res) {
      etcdData.status = 'error';
      etcdData.error = res.data.msg;
    });
    return etcdData;
  }

  /**
   * [show description]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  function show(key) {
    return list(key).then(function (res) {
      etcdData.currentPath = key;
      etcdData.paths = getPaths(key);
      etcdData.nodes[key] = res.data;
    }, function (res) {
      // body...
    });
  }

  /**
   * [list description]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  function list(key) {
    var url = '/etcd/list';
    if (key) {
      url += key;
    }
    var promise =  $http.get(url);
    promise.then(function (res) {
      angular.forEach(res.data, function (item) {
        item.value = JSON.stringify(item.value, null, 2);
      });
    });
    return promise;
  }

  /**
   * [getPaths description]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  function getPaths(key) {
    if (key === '/') {
      return ['root'];
    } else {
      var arr = key.split('/');
      arr[0] = 'root';
      return arr;
    }
  }
  // var data = {
  //   // 当前的etcd nodes
  //   nodes : null,
  //   // 用于保存要添加的节点数据
  //   node : {}
  // };
  // return {
  //   get : get,
  //   init : init,
  //   del : del,
  //   add : add,
  //   validate : validate
  // };
  //
  // /**
  //  * [init description]
  //  * @return {[type]} [description]
  //  */
  // function init() {
  //   var nodes = [];
  //   nodes = _.sortBy(nodes, function(node) {
  //     return node.key;
  //   });
  //   data.nodes = nodes;
  //   $timeout(function() {
  //     data.status = 'success';
  //   });
  //   return data;
  // }
  //
  // /**
  //  * [convert description]
  //  * @param  {[type]} node [description]
  //  * @return {[type]}      [description]
  //  */
  // function convert(node) {
  //   var v = _.isUndefined(node.value)? '--' : JSON.stringify(node.value);
  //   return {
  //     key : node.key,
  //     value : v,
  //     dir : !!node.dir,
  //     ttl : _.isUndefined(node.ttl)? '--' : node.ttl
  //   };
  // }
  // /**
  //  * [get description]
  //  * @param  {[type]} key [description]
  //  * @param  {[type]} dir [description]
  //  * @return {[type]}     [description]
  //  */
  // function get(key, dir){
  //   var url = '/etcd/get?key=' + key;
  //   if (dir) {
  //     url += '&dir=1';
  //   }
  //   var promise = $http.get(url);
  //   promise.then(function (res) {
  //     var data = res.data;
  //     if (_.isArray(data)) {
  //       res.data = _.map(res.data, convert);
  //     } else {
  //       res.data = convert(data);
  //     }
  //   });
  //   return promise;
  // }
  //
  // /**
  //  * [del description]
  //  * @param  {[type]} key [description]
  //  * @param  {[type]} dir [description]
  //  * @return {[type]}     [description]
  //  */
  // function del(key, dir) {
  //   var url = '/etcd/del?key=' + key;
  //   if (dir) {
  //     url += '&dir=1';
  //   }
  //   return $http['delete'](url);
  // }
  //
  // /**
  //  * [validate description]
  //  * @param  {[type]} node [description]
  //  * @return {[type]}      [description]
  //  */
  // function validate(node) {
  //   if (node.dir) {
  //     if (!node.key) {
  //       return {
  //         ok : false,
  //         msg : '创建dir，key不能为空'
  //       };
  //     }
  //   } else {
  //     if (!node.key || !node.value) {
  //       return {
  //         ok : false,
  //         msg : 'key, value不能为空'
  //       };
  //     }
  //   }
  //   return {
  //     ok : true
  //   };
  // }
  //
  //
  // /**
  //  * [add description]
  //  * @param {[type]} node [description]
  //  */
  // function add(node) {
  //   return $http.post('/etcd/add', node);
  // }

}


function jtCodeMirror() {
  function codeMirrorLink(scope, element, attr) {
    var model = attr.jtCodeMirror;
    var codeMirrorEditor;
    var ctrl = '<div class="ctrls">' +
      '<a href="javascript:;" class="glyphicons glyphicons-ok-2"></a>' +
      '<a href="javascript:;" class="glyphicons glyphicons-remove-2"></a>' +
    '</div>';
    scope.$watch(model + '.modifing', function (v) {
      if (v) {
        showCodeMirror();
      }
    });

    function close() {
      scope.$apply(function(){
        scope[model].modifing = false;
      });
      codeMirrorEditor.remove();
      codeMirrorEditor = null;
    }

    function showCodeMirror() {
      if (codeMirrorEditor) {
        codeMirrorEditor.remove();
      }
      var obj = angular.element('<div class="codeMirrorEditor"></div>');
      obj.insertAfter(element);
      var editor = CodeMirror(obj.get(0), {
        lineNumbers: true,
        mode : 'json',
        tabSize : 2,
        value : scope[model].value,
        theme : 'monokai'
      });
      obj.append(ctrl);
      obj.find('.glyphicons-remove-2').click(close);
      obj.find('.glyphicons-ok-2').click(function(){
        close();
      });
      codeMirrorEditor = obj;
    }
  }
  return {
    restrict : 'A',
    link : codeMirrorLink
  };
}
})(this);
