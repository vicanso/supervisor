;(function(global){
'use strict';

angular.module('jtApp').factory('varnishService', ['$http', 'debug', function($http, debug){
  debug = debug('jt.varnishPage');
  var varnishService = {
    backendList : backendList
  };
  return varnishService;

  /**
   * [backendList 获取服务器列表]
   * @param  {[type]} ip   [description]
   * @param  {[type]} port [description]
   * @return {[type]}      [description]
   */
  function backendList(ip, port){
    var url = 'http://' + ip + ':' + port + '/v-servers';
    debug('get backend form:%s', url);
    url = 'http://vicanso.com:6081/v-servers';
    var promise = $http.get(url);
    promise.then(function(res){
      console.dir(res);
    });
    return promise;
  }

}]);

var fn = function($scope, $http, debug, vs){
  var self = this;
  debug = debug('jt.varnishPage');

  self.showBackendList = showBackendList;

  return self;

  function showBackendList(ip, port){
    vs.backendList(ip, port)
  }

};
fn.$inject = ['$scope', '$http', 'debug', 'varnishService'];
angular.module('jtApp')
  .controller('VarnishPageController', fn);
})(this);