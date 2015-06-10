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

  return self;

  function showBackends(ip, port){
    var html = '<jt-dialog class="dialog">' +
      '<h3 class="title">服务器列表<h3>' +
    '</jt-dialog>';
    var obj = angular.element(html);

    var tmpScope = $scope.$new(true);
    angular.extend(tmpScope, {
      status : 'show',
      modal : true
    });
    $compile(obj)(tmpScope);
    $element.append(obj);
    vs.backends(ip, port).then(function(res){
      var data = res.data;
    }, function(res){

    });
  }

};
fn.$inject = ['$scope', '$http', '$compile', '$element', 'debug', 'varnishService'];
angular.module('jtApp')
  .controller('VarnishPageController', fn);
})(this);