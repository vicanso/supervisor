(function (global) {
  'use strict';

  ctrl.$inject = ['$scope', '$http', '$timeout', '$compile', '$element',
    'backendService', 'debug'
  ];
  service.$inject = ['$http'];

  var app = angular.module('jtApp');
  app.factory('backendService', service);
  app.directive('httpStats', httpStatsDirective);
  app.controller('BackendPageController', ctrl);


  function ctrl($scope, $http, $timeout, $compile, $element, backendService,
    debug) {
    /*jshint validthis:true */
    var self = this;

    self.deregister = deregister;
    self.selectType = selectType;
    self.showStats = showStats;

    self.data = {
      type: JT_GLOBAL.type,
      status: '',
      init: false
    };

    window.onpopstate = function onpopstate(e) {
      $scope.$apply(function () {
        self.data.type = e.state.type;
      });
    };

    $timeout(function () {
      self.data.init = true;
    }, 1);

    $scope.$watch('backendPage.data.type', function changeType(type) {
      if (type) {
        showBackends(self.data);
      }
    });

    return self;

    /**
     * [selectType description]
     * @param  {[type]} type [description]
     * @param  {[type]} e    [description]
     * @return {[type]}      [description]
     */
    function selectType(type, e) {
      if (type === self.data.type) {
        e.preventDefault();
        return;
      }
      if (history.pushState) {
        var url = angular.element(e.target).attr('href');
        e.preventDefault();
        self.data.type = type;
        history.pushState({
          type: type,
          url: url
        }, type, url);
      }
    }

    /**
     * [deregister description]
     * @param  {[type]} backend [description]
     * @return {[type]}         [description]
     */
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

    /**
     * [showBackends description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    function showBackends(data) {
      if (data.status === 'loading') {
        return;
      }
      data.status = 'loading';
      data.backends = null;
      backendService.list(data.type).then(function (res) {
        data.status = 'success';
        data.backends = res.data;
      }, function (res) {
        data.status = 'error';
        data.error = res.error;
      });
    }

    /**
     * [showStats description]
     * @param  {[type]} backend [description]
     * @return {[type]}          [description]
     */
    function showStats(backend) {
      if (backend.jqObj) {
        backend.jqObj.remove();
        delete backend.jqObj;
      } else {
        var html =
          '<div class="statsContainer"><http-stats></http-stats></div>';
        var obj = angular.element(html);
        $compile(obj.contents())(backend.stats);
        $element.append(obj);
        backend.jqObj = obj;
      }

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


  function httpStatsDirective() {
    function link(scope, element, attr) {
      var html = '<pre class="code">' + JSON.stringify(scope, null, 2) +
        '</pre>';
      element.html(html);
    }

    return {
      restrict: 'E',
      link: link
    };
  }

})(this);
