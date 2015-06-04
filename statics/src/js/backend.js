;(function(global){
'use strict';

var module = angular.module('jt.service.backend', []);
module.factory('backendService', ['$http', function($http){
  var backend = {
    statu : '',
    op : '',
    config : {}
  };


  var backendService = {
    init : function(){
      return backend;
    },
    save : save,
    remove : remove
  };

  // 检测字段是否有为空
  function checkFields(){
    var keys = 'name category ip port'.split(' ');
    var config = backend.config;
    var isFail = false;
    angular.forEach(keys, function(key){
      if(!config[key]){
        isFail = true;
      }
    });
    return isFail;
  }

  /**
   * [save 保存backend配置]
   * @return {[type]} [description]
   */
  function save(){
    if(checkFields()){
      backend.status = 'error';
      backend.error = 'the field can not be empty.';
      return;
    }
    var promise = $http.post('/backend', backend.config);
    backend.status = 'submiting';
    backend.op = 'save';
    promise.then(function(res){
      backend.status = 'success';
    }, function(res){
      backend.status = 'error';
    });
    return promise;
  }

  /**
   * [remove 删除backend]
   * @return {[type]} [description]
   */
  function remove(key){
    var promise = $http['delete']('/backend' + key);
    backend.op = 'remove';
    promise.then(function(){
      backend.status = 'success';
    }, function(res){
      backend.status = 'error';
    });
    return promise;
  }

  return backendService;
}]);

var fn = function($scope, $http, debug, backendService){

  var self = this;

  self.mode = 'view'

  // 保存backend的配置信息
  self.backend = backendService.init();

  // 保存backend
  self.save = function(){
    backendService.save().then(function(){
      setTimeout(function(){
        location.reload();
      }, 3000);
    });
  };

  // 删除backend
  self.remove = function(key, e){
    backendService.remove(key).then(function(){
      angular.element(e.target).closest('tr').remove();
    });
  }

  $scope.$watch('backendPage.backend.config', function(){
    self.backend.status = '';
  }, true);



  return self;
};
fn.$inject = ['$scope', '$http', 'debug', 'backendService'];

angular.module('jtApp')
  .addRequires('jt.service.backend')
  .controller('BackendPageController', fn);

})(this);