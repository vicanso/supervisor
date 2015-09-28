;
(function(global) {
  'use strict';

  ctrl.$inject = ['$scope', '$http', 'debug'];

  angular.module('jtApp')
    .controller('BackendPageController', ctrl);

  function ctrl($scope, $http, debug) {
    /*jshint validthis:true */
    var self = this;

    self.deregister = deregister;
    self.status = {};

    return self;

    function deregister(id) {
      if (self.status[id] === 'doing') {
        return;
      }
      self.status[id] = 'doing';
      $http.post('/backend/deregister/' + id).then(function(res) {
        self.status[id] = 'success';
      }, function(res) {
        self.status[id] = 'error';
      });
    }

  }

})(this);
