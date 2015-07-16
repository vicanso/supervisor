/*!
 * 记录发送ajax请求的响应时间和状态码等
 * @return {[type]} [description]
 */
;(function(){
'use strict';
var module = angular.module('jt.service.httpLog', ['LocalStorageModule']);
var now = Date.now || function(){
  return new Date().getTime();
};

module.factory('httpLog', ['$q', '$injector', 'CONST', 'localStorageService', function($q, $injector, CONST, localStorageService){
  // 本地存储http log，定时将所有的log往服务器发送
  var httpLogStorage = localStorageService.get('httpLog') || {
    success : [],
    error : []
  };
  var successLog = httpLogStorage.success;
  var errorLog = httpLogStorage.error;
  var postInterval = 120 * 1000;
  var postUrl = '/sys/http-log';

  // 如果一开始log已经有20个，直接往后台post
  if(successLog.length + errorLog.length > 10){
    setTimeout(post, 1);
  }else{
    setTimeout(post, postInterval);
  }

  var httpLog = {
    request : function(config){
      config._createdAt = now();
      return config;
    },
    response : function(res){
      var config = res.config;
      var url = config.url;
      alertDeprecate(res.headers, url);
      if(isIgnore(url)){
        return res;
      }
      var use = now() - config._createdAt;
      successLog.push({
        url : url,
        method : config.method,
        use : use
      });
      save();
      return res;
    },
    requestError : function(rejection){
      return $q.reject(rejection);
    },
    responseError : function(rejection){
      var config = rejection.config;
      var url = config.url;
      alertDeprecate(rejection.headers, url);
      if(isIgnore(url)){
        return $q.reject(rejection);
      }
      errorLog.push({
        url : url,
        method : config.method,
        status : rejection.status,
        use : now() - config._createdAt
      });
      save();
      return $q.reject(rejection);
    }
  };
  return httpLog;



  // 判断该请求是否忽略其统计
  function isIgnore(url){
    if(url === postUrl || url.indexOf('httplog=false') != -1){
      return true;
    }else{
      return false;
    }
  }

  /**
   * [alertDeprecate 如果发现后端请求有Deprecate，在开发环境中，弹出警告窗]
   * @param  {[type]} headers [description]
   * @param  {[type]} url [description]
   * @return {[type]}         [description]
   */
  function alertDeprecate(headers, url){
    var deprecate = headers('JT-Deprecate');
    if(deprecate && CONST.env === 'development'){
      alert('url:' + url + 'is deprecate, ' + deprecate);
    }
  }

  /**
   * [save 保存统计数据到local storage]
   * @return {[type]} [description]
   */
  function save(){
    localStorageService.set('httpLog', httpLogStorage);
  }

  /**
   * [post 发送统计数据到服务器]
   * @return {[type]} [description]
   */
  function post(){
    var $http = $injector.get('$http');
    if(successLog.length || errorLog.length){
      $http.post(postUrl, httpLogStorage).success(function(res){
        successLog.length = 0;
        errorLog.length = 0;
        save();
        setTimeout(post, postInterval);
      }).error(function(res){
        setTimeout(post, postInterval);
      });
    }
  }

}]);

})(this);
