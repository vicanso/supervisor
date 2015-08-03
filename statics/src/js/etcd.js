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
  debug = debug('jt.etcd');
  self.data = etcdService.init();
  self.show = show;
  self.showPath = showPath;
  self.modify = modify;
  self.save = save;
  self.del = del;
  self.modify = modify;
  self.cancelModify = cancelModify;
  self.cancelAdd = cancelAdd;
  self.addToDir = addToDir;
  self.addNode = {
    show : false
  };
  self.template = template;

  return self;

  /**
   * [show description]
   * @param  {[type]} node [description]
   * @return {[type]}     [description]
   */
  function show(node) {
    node.status = 'showDetail';
    debug('show:%j', node);
    etcdService.show(node.key).then(function (res) {
      debug('show success:%j', res.data);
      node.status = '';
    }, function (res) {
      debug('show fail:%j', res.data);
      node.status = '';
    });
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
    var key = '/' + keyArr.join('');
    debug('show path:%s', key);
    etcdService.show(key);
  }

  /**
   * [save description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  function save(value){
    var data = _.pick(self.addNode, ['key', 'ttl', 'dir']);
    if (data.key.charAt(0) !== '/') {
      data.key = '/' + data.key;
    }
    try {
      value = JSON.parse(value);
    } catch (e) {

    } finally {
      data.value = value;
    }
    self.addNode.status = 'submitting';
    etcdService.save(data).then(function (res) {
      self.addNode.show = false;
      self.addNode.status = '';
      self.data.nodes[self.data.currentPath].push(data);
    }, function (res) {
      self.addNode.status = '';
      util.alert('出错了', '保存节点失败：' + res.data.msg, 1);
    });
  }

  /**
   * [del description]
   * @param  {[type]} node [description]
   * @return {[type]}      [description]
   */
  function del(node) {
    var str = '请注意，节点：' + node.key + '删除之后将无法恢复。';
    if (node.dir) {
      str += '(注：包括它的子节点)';
    }
    util.alert('确定要删除该节点吗？', str).then(function() {
      node.status = 'deleting';
      etcdService.del(node.key, node.dir).then(function (res) {
        node.status = '';
      }, function (res) {
        node.status = '';
        var msg = '删除节点失败：' + res.data.msg + '。该节点下是否还有节点未删除？';
        util.alert('出错了', msg, 1);
      });
    });
  }


  /**
   * [findModifyNode description]
   * @return {[type]} [description]
   */
  function findModifyNode() {
    return _.find(self.data.nodes[self.data.currentPath], function (node) {
      return node.modifing;
    });
  }


  /**
   * [cancelModify description]
   * @param  {[type]} argument [description]
   * @return {[type]}          [description]
   */
  function cancelModify() {
    var node = findModifyNode();
    node.modifing = false;
    $scope.$digest();
  }


  /**
   * [modify description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  function modify(value) {
    var node = findModifyNode();
    var data = _.pick(node, ['key', 'ttl', 'dir']);
    try {
      value = JSON.parse(value);
    } catch (e) {
    } finally {
      data.value = value;
    }
    etcdService.save(data).then(function (res) {
      node.value = JSON.stringify(data.value, null, 2);
      node.modifing = false;
    }, function (res) {
      util.alert('出错了', '修改节点失败：' + res.data.msg, 1);
    });
  }

  /**
   * [addToDir description]
   * @param {[type]} key [description]
   */
  function addToDir(key) {
    self.addNode = {
      show : true,
      dir : true,
      key : key
    };
  }


  /**
   * [cancelAdd description]
   * @return {[type]} [description]
   */
  function cancelAdd() {
    self.addNode = {
      show : false
    };
    $scope.$digest();
  }

  /**
   * [template description]
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  function template(type) {
    var data = {
      name : "backend-name",
      ip : "backend-ip",
      port : 10000,
      prefix : 'backend-prefix, optional',
      weight : 'load balance\'s weight, optional'
    };
    self.addNode.value = JSON.stringify(data, null, 2);
  }

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
    show : show,
    save : save,
    del : del
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
    var promise = list(key);
    promise.then(function (res) {
      etcdData.currentPath = key;
      etcdData.paths = getPaths(key);
      etcdData.nodes[key] = res.data;
    });
    return promise;
  }

  /**
   * [list description]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  function list(key) {
    var url = '/etcd/list';
    if (key) {
      url += ('?key=' + key);
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

  /**
   * [save description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  function save(data) {
    return $http.post('/etcd/add', data);
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
      url += '&dir=true';
    }
    var promise = $http.delete(url);
    promise.then(function () {
      etcdData.nodes[etcdData.currentPath] = _.filter(etcdData.nodes[etcdData.currentPath], function (node) {
        return node.key !== key;
      });
    });
    return promise;
  }

}


function jtCodeMirror($parse) {
  function codeMirrorLink(scope, element, attr) {
    var model = attr.jtValue;
    if (model) {
      scope.$parent.$watch(model, function (v) {
        var editor = codeMirrorObj && codeMirrorObj.editor;
        if (editor && v) {
          editor.doc.setValue(v);
        }
      });
    }

    var codeMirrorObj;
    var ctrl = '<div class="ctrls">' +
      '<a href="javascript:;" class="glyphicons glyphicons-ok-2"></a>' +
      '<a href="javascript:;" class="glyphicons glyphicons-remove-2"></a>' +
    '</div>';

    showCodeMirror();

    function close() {
      if (codeMirrorObj) {
        codeMirrorObj.remove();
        codeMirrorObj = null;
        scope.close();
      }
    }

    function showCodeMirror() {
      if (codeMirrorObj) {
        codeMirrorObj.remove();
      }
      var obj = angular.element('<div class="codeMirrorEditor"></div>');
      obj.appendTo(element);
      var editor = new CodeMirror(obj.get(0), {
        mode : 'json',
        tabSize : 2,
        theme : 'monokai',
        value : '',
        autofocus : true
      });
      obj.append(ctrl);
      obj.find('.glyphicons-remove-2').click(close);
      obj.find('.glyphicons-ok-2').click(function(){
        scope.save({value : editor.getValue()});
      });
      codeMirrorObj = obj;
      codeMirrorObj.editor = editor;
    }
  }
  return {
    restrict : 'E',
    scope : {
      'save' : '&onSave',
      'close' : '&onCancel'
    },
    link : codeMirrorLink
  };
}

jtCodeMirror.$inject = ['$parse'];

})(this);
