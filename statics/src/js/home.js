;(function(global){
'use strict';

ctrl.$inject = ['$scope', '$http', 'debug', 'user'];

angular.module('jtApp')
  .controller('HomePageController', ctrl);

function ctrl($scope, $http, debug, user) {
  user.session().then(function(res){
    // user.login('vicanso', 'abcde').success(function(res){
    //   console.dir(res);
    // });
    // user.logout().then(function(res){

    // });
  }, function(err){

  });
  // $http.get('/user').success(function(res){
  //   console.dir(res);
  // }).error(function(err){

  // });
}

})(this);
