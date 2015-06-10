;(function(global){
'use strict';

angular.module('jtApp').factory('varnishService', ['$http', 'debug', function($http, debug){
  debug = debug('jt.varnishPage');
  var varnishService = {
    backends : backends
  };
  return varnishService;

  /**
   * [backends 获取服务器列表]
   * @param  {[type]} ip   [description]
   * @param  {[type]} port [description]
   * @return {[type]}      [description]
   */
  function backends(ip, port){
    var url = '/varnish/backends/' + ip + '/' + port;
    debug('get backend form:%s', url);
    var promise = $http.get(url);
    return promise;
  }

}]);

var fn = function($scope, $http, $compile, $element, debug, vs){
  var self = this;
  debug = debug('jt.varnishPage');

  self.showBackends = showBackends;

  self.opList = [];

  return self;

  /**
   * [showBackends 显示服务器列表]
   * @param  {[type]} index [description]
   * @param  {[type]} ip    [description]
   * @param  {[type]} port  [description]
   * @return {[type]}       [description]
   */
  function showBackends(index, ip, port){
    self.opList[index] = 0;
    var obj = angular.element(angular.element('#backendsTpl').html());
    vs.backends(ip, port).then(function(res){
      var tmpScope = $scope.$new(true);
      angular.extend(tmpScope, {
        status : 'show',
        modal : true,
        backends : res.data
      });
      $compile(obj)(tmpScope);
      $element.append(obj);
      self.opList[index] = -1;
    }, function(res){
      self.opList[index] = -1;
      alert(res.data.error || '加载数据失败！');
    });
  }

  /**
   * [showVcl 显示vcl配置]
   * @param  {[type]} index [description]
   * @param  {[type]} ip    [description]
   * @param  {[type]} port  [description]
   * @return {[type]}       [description]
   */
  function showVcl(index, ip, port){

  }

};
fn.$inject = ['$scope', '$http', '$compile', '$element', 'debug', 'varnishService'];
angular.module('jtApp')
  .controller('VarnishPageController', fn);
})(this);