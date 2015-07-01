;(function(global){
'use strict';
var fn = function($scope, $http, debug, user){
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
};
fn.$inject = ['$scope', '$http', 'debug', 'user'];

angular.module('jtApp')
  .controller('HomePageController', fn);

})(this);