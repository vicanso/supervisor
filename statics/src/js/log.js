(function(global) {
  'use strict';

  ctrl.$inject = ['$scope', '$http', 'debug', 'logService'];
  service.$inject = ['$http', 'debug'];
  jtLogListDirective.$inject = ['$timeout'];

  var app = angular.module('jtApp');
  app.factory('logService', service);
  app.directive('jtLogList', jtLogListDirective);
  app.controller('LogPageController', ctrl);

  function ctrl($scope, $http, debug, logService) {
    /*jshint validthis:true */
    var self = this;
    self.logViews = [];

    // logService.init('http://localhost:6020');
    //
    // subscribe('test', 0);

    return self;


    function subscribe(topic, index) {
      var logView = self.logViews[index];
      if (!logView) {
        logView = {};
        self.logViews[index] = logView;
      }
      logView.topic = topic;
      logView.logs = [];
      var logs = logView.logs;
      logService.subscribe(topic, function(data) {
        logs.push(data);
      });
    }
  }



  function service($http, debug) {
    var socket;
    var cbList = {};
    return {
      init: init,
      subscribe: subscribe,
      unsubscribe: unsubscribe
    };

    /**
     * [init description]
     * @param  {[type]} url [description]
     * @return {[type]}     [description]
     */
    function init(url) {
      debug('init socket io:%s', url);
      socket = io.connect(url);
      socket.on('subscribe', function(res) {
        var topic = res.topic;
        var data = JSON.parse(res.data);
        data.id = _.uniqueId();
        _.forEach(cbList[topic], function(cb) {
          cb(data);
        });
      });
    }

    /**
     * [subscribe description]
     * @param  {[type]}   topic [description]
     * @param  {Function} cb    [description]
     * @return {[type]}         [description]
     */
    function subscribe(topic, cb) {
      if (!socket) {
        throw new Error('socket is not init');
      }
      socket.emit('subscribe', topic);
      if (!cbList[topic]) {
        cbList[topic] = [];
      }
      cbList[topic].push(cb);
    }

    /**
     * [unsubscribe description]
     * @param  {[type]}   topic [description]
     * @param  {Function} cb    [description]
     * @return {[type]}         [description]
     */
    function unsubscribe(topic, cb) {
      if (!socket) {
        throw new Error('socket is not init');
      }
      if (!cb) {
        cbList[topic] = [];
      } else {
        _.pull(cbList[topic], cb);
      }

      if (_.isEmpty(cbList[topic])) {
        socket.emit('unsubscribe', topic);
      }
    }
  }

  function jtLogListDirective($timeout) {
    function link(scope, element, attr) {
      var lastId = '';
      var timer = null;
      var logContainer = init();

      refreshLogs();

      function refreshLogs() {
        var logs = scope.logView.logs;
        var index = _.findLastIndex(logs, function(log) {
          return log.id === lastId;
        });
        var htmlArr = [];
        for (var i = index + 1; i < logs.length; i++) {
          var log = logs[i];
          lastId = log.id;

          var html = '<span class="timestamp">' + format(log.timestamp) +
            '</span>';
          html += ('<span class="level level-' + log.level + '">' + log.level +
            '</span>');
          html += ('<span>' + log.message + '</span>');
          htmlArr.push('<li>' + html + '</li>');
        }
        if (htmlArr.length) {
          logContainer.append(htmlArr.join(''));
        }
        timer = setTimeout(refreshLogs, 100);
      }

      function format(str, includeDate) {
        var date = new Date(str);
        str = '';
        var year = date.getFullYear();

        var month = date.getMonth() + 1;
        if (month < 10) {
          month = '0' + month;
        }

        var day = date.getDate();
        if (day < 10) {
          day = '0' + day;
        }
        if (includeDate) {
          str = '' + year + '-' + month + '-' + day + ' ';
        }

        var hours = date.getHours();
        if (hours < 10) {
          hours = '0' + hours;
        }

        var minutes = date.getMinutes();
        if (minutes < 10) {
          minutes = '0' + minutes;
        }

        var seconds = date.getSeconds();
        if (seconds < 10) {
          seconds = '0' + seconds;
        }

        return str + hours + ':' +
          minutes + ':' + seconds;
      }

      function init() {
        var container = angular.element('<ul></ul>');
        container.appendTo(element);
        return container;
      }



      scope.$on('$destroy', function() {
        clearTimeoout(timer);
        console.dir('$destroy');
      });
    }

    return {
      restrict: 'E',
      link: link
    };
  }
})(this);
