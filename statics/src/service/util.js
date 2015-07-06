/*!
 * util模块
 * @return {[type]} [description]
 */
;(function(global){
'use strict';
var module = angular.module('jt.service.util', []);
function noop(){}
function utilFn($rootScope, $compile, $document, $q){
  return {
    alert : alert
  };

  /**
   * [alert description]
   * @param  {[type]} title [description]
   * @param  {[type]} msg   [description]
   * @param  {[type]} btns  [description]
   * @return {[type]}       [description]
   */
  function alert(title, msg, btns) {
    var deferred = $q.defer();
    var html = '<jt-dialog class="dialog">' +
      '<div class="title">' + title +
        '<a class="pull-right destroy" href="javascript:;">' +
          '<span class="glyphicons glyphicons-remove-2"></span>'
        + '</a>' +
      '</div>' +
      '<div class="content"><p>' + msg + '</p>' +
      '<div class="btns text-center">' +
        '<button type="button" class="btn btn-default destroy">取消</button>' +
        '<button type="button" class="btn btn-primary" ng-click="submit()">确定</button>' +
      '</div>' +
    '</div>';
    var obj = angular.element(html);
    var tmpScope = $rootScope.$new(true);
    angular.extend(tmpScope, {
      status : 'show',
      modal : true,
      submit : function(){
        unwatch();
        tmpScope.destroy();
        deferred.resolve();
      }
    });
    $compile(obj)(tmpScope);
    obj.appendTo('body');
    var unwatch = tmpScope.$on('$destroy', deferred.reject);
    return deferred.promise;
  }



}
utilFn.$inject = ['$rootScope', '$compile', '$document', '$q'];
module.factory('util', utilFn);
})(this);
