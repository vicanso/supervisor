;(function(global){

'use strict';
var requires = ['LocalStorageModule', 'jt.service.const', 'jt.service.debug', 'jt.service.httpLog', 'jt.service.user', 'jt.directive.widget'];
var app = angular.module('jtApp', requires);

// 用户在controller中添加require
app.addRequires = function(arr) {
  if (!angular.isArray(arr)) {
    arr = [arr];
  }
  var requires = app.requires;
  angular.forEach(arr, function(item) {
    if (!~requires.indexOf(item)) {
      requires.push(item);
    }
  });
  return this;
};


app.config(['localStorageServiceProvider', function(localStorageServiceProvider)  {
  // localstorage的前缀
  localStorageServiceProvider.prefix = 'jt';
}]).config(['$httpProvider', 'CONST', function($httpProvider, CONST) {
  // 对ajax的请求添加特定header
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

  // 如果有配置app的前缀，对所有的http请求添加处理
  var prefix = CONST.appUrlPrefix;
  if (prefix) {
    var fn = addUrlPrefix(prefix);
    $httpProvider.interceptors.push(fn);
  }

  // http log
  $httpProvider.interceptors.push('httpLog');
}]).config(['$provide', function($provide) {
  var params = ['$log', '$injector', 'CONST', error];
  $provide.decorator('$exceptionHandler', params);
}]);


app.run(['$http', '$timeout', '$window', 'localStorageService', 'CONST', 'debug', run]);


/**
 * [addUrlPrefix 添加http请求前缀]
 * @param {[type]} prefix [description]
 */
function addUrlPrefix(prefix) {
  return function(){
    return {
      request : function(config){
        config.url = prefix + config.url;
        return config;
      }
    };
  };
}

/**
 * [error 出错处理]
 * @param  {[type]} $log      [description]
 * @param  {[type]} $injector [description]
 * @return {[type]}           [description]
 */
function error($log, $injector, CONST) {
  return function(exception, cause) {
    if (CONST.env === 'development') {
      alert(exception.message);
      $log.error.apply($log, arguments);
    } else {
      var $http = $injector.get('$http');
      $http.post('/exception?httplog=false', {
        message : exception.message,
        stack : exception.stack,
        cause : cause
      });
    }

  };
}

/**
 * [run description]
 * @param  {[type]} $http               [description]
 * @param  {[type]} $timeout            [description]
 * @param  {[type]} $window             [description]
 * @param  {[type]} localStorageService [description]
 * @param  {[type]} CONST               [description]
 * @param  {[type]} debug               [description]
 * @return {[type]}                     [description]
 */
function run($http, $timeout, $window, localStorageService, CONST, debug){
  TIMING.end('js');
  debug = debug('app.run');
  var statistics = function() {
    var result = angular.extend({
      timeline : TIMING.getLogs(),
      screen : {
        width : $window.screen.width,
        height : $window.screen.height,
        innerHeight : $window.innerHeight,
        innerWidth : $window.innerWidth
      },
      // 在deploy之后，非第一次加载
      load : 2,
    }, $window.performance);
    if (localStorageService.getStorageType() === 'localStorage') {
      // 判断该页面是不是在版本更新之后第一次加载
      // （第一次加载需加载静态文件，时间较长）
      var appVersion = localStorageService.get('appVersion');
      if (CONFIG.appVersion !== appVersion) {
        localStorageService.set('appVersion', CONFIG.appVersion);
        localStorageService.set('loadTemplateList', []);
      }
      var tmpList = localStorageService.get('loadTemplateList') || [];
      if (tmpList.indexOf(CONFIG.template) === -1) {
        if (appVersion) {
          // 有之前的版本号，非第一次打开
          result.load = 1;
        } else {
          // 无任何之前的版本号，第一次打开
          result.load = 0;
        }
        tmpList.push(CONFIG.template);
        localStorageService.set('loadTemplateList', tmpList);
      }
    }

    $http.post('/sys/statistics', result);
  };

  $window.onload = function(){
    statistics();
  };


  if (CONST.env !== 'development') {
    return;
  }
  var checkInterval = 10 * 1000;
  var checkWatchers = function() {
    var watchTotal = 0;
    var fn = function(element) {
      if (element.data().hasOwnProperty('$scope')) {
        var watchers = element.data().$scope.$$watchers;
        if(watchers){
          watchTotal += watchers.length;
        }
      }
      angular.forEach(element.children(), function(child){
        fn(angular.element(child));
      });
    };
    fn(angular.element(document.body));
    debug('watcher total:' + watchTotal);
    $timeout(function(){
      checkWatchers();
    }, checkInterval);
  };

  $timeout(function(){
    checkWatchers();
  }, checkWatchers);
}



app.controller('AppController', AppController);
function AppController($scope, $http, $compile, $element, user) {
  var ctrl = this;

  ctrl.login = login;

  ctrl.logout = logout;

  ctrl.register = register;

  ctrl.session = {};


  $scope.$on('user', function(e, type) {
    getSession();
  });
  getSession();


  function showDialog(type) {
    var obj = angular.element(angular.element('#loginDialog').html());
    var tmpScope = $scope.$new(true);
    angular.extend(tmpScope, {
      status : 'show',
      type : type,
      modal : true
    });

    $compile(obj)(tmpScope);
    $element.append(obj);
    tmpScope.submit = function(){
      submit(tmpScope);
    };
    angular.forEach(['account', 'password'], function(key){
      tmpScope.$watch(key, function(){
        tmpScope.error = '';
      });
    });
  }

  function login() {
    showDialog('login');
  }

  function register() {
    showDialog('register');
  }


  function logout() {
    user.logout();
  }

  function submit(tmpScope) {
    if(!tmpScope.account || !tmpScope.password){
      tmpScope.error = '账号和密码均不能为空';
      return;
    }

    tmpScope.submiting = true;
    tmpScope.msg = '正在提交，请稍候...';
    var fn = user[tmpScope.type];
    if (fn) {
      fn(tmpScope.account, tmpScope.password).success(function() {
        tmpScope.destroy();
      }).error(function(res) {
        tmpScope.error = res.msg || res.error || '未知异常';
        tmpScope.submiting = false;
        tmpScope.msg = '';
      });
    }
  }

  // 获取用户信息
  function getSession() {
    ctrl.session.status = 'loading';
    user.session().then(function(res) {
      angular.extend(ctrl.session, res);
      ctrl.session.status = 'success';
    }, function(err){
      ctrl.session.error = err;
      ctrl.session.status = 'fail';
    });
  }
}

AppController.$inject = ['$scope', '$http', '$compile', '$element', 'user'];

})(this);
