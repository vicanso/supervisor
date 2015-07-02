;(function(global){
'use strict';

ctrl.$inject = ['$scope', '$http', 'debug', 'etcdService'];
service.$inject = ['$http'];


angular.module('jtApp').factory('etcdService', service);
angular.module('jtApp')
  .controller('EtcdPageController', ctrl);



function ctrl($scope, $http, debug, etcdService) {


  etcdService.get('/test/6').then(function(res) {
    console.dir(res);
  });
}

function service($http) {
  return {
    get : get
  };


  function get(key){
    return $http.get('/etcd/get?key=' + key);
  }

}
})(this);
