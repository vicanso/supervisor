;
(function (global) {
  'use strict';

  ctrl.$inject = ['$scope', '$http', '$timeout', 'backendService', 'debug'];
  service.$inject = ['$http'];

  var app = angular.module('jtApp');
  app.factory('backendService', service);
  app.controller('BackendPageController', ctrl);


  function ctrl($scope, $http, $timeout, backendService, debug) {
    /*jshint validthis:true */
    var self = this;

    self.deregister = deregister;
    self.selectType = selectType;

    self.data = {
      type: 'http-ping',
      status: '',
      init: false
    };
    init();
    return self;

    function selectType(type) {
      console.dir(type);
    }

    function deregister(backend) {
      if (backend.status === 'doing') {
        return;
      }
      backend.status = 'doing';
      backendService.deregister(backend.id).then(function (res) {
        backend.status = 'success';
      }, function (res) {
        backend.status = 'error';
        backend.error = res.error;
      });
    }

    function showBackends(data) {
      if (data.status === 'loading') {
        return;
      }
      data.status = 'loading';
      backendService.list(data.type).then(function (res) {
        data.status = 'success';
        data.backends = res.data;
      }, function (res) {
        data.status = 'error';
        data.error = res.error;
      });
    }

    function init() {
      showBackends(self.data);
      $timeout(function () {
        self.data.init = true;
      }, 1);
    }

  }


  function service($http) {
    return {
      list: list,
      deregister: deregister
    };

    function list(type) {
      return $http.get('/backends/' + type);
    }

    function deregister(node) {
      return $http.post('/backend/deregister/' + node);
    }
  }

})(this);
