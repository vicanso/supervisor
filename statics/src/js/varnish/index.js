;(function(global){
'use strict';
var fn = function($scope, $http, $compile, $element, debug, vs){
  var self = this;
  debug = debug('jt.varnishPage');

  var varnishList = JT_GLOBAL.varnishList;

  self.showBackends = showBackends;
  self.showVcl = showVcl;
  self.showStats = showStats;

  self.opList = [];

  return self;

  /**
   * [showBackends 显示服务器列表]
   * @param  {[type]} index [description]
   * @return {[type]}       [description]
   */
  function showBackends(index){
    self.opList[index] = 0;
    showDialog(vs.backends, index, '#backendsTpl');
  }

  /**
   * [showVcl 显示vcl配置]
   * @param  {[type]} index [description]
   * @return {[type]}       [description]
   */
  function showVcl(index){
    self.opList[index] = 1;
    showDialog(vs.vcl, index, '#vclTpl');
  }

  function showStats(index){
    self.opList[index] = 2;
    showDialog(vs.stats, index, '#statsTpl');
  }

  /**
   * [showDialog description]
   * @param  {Function} fn    [description]
   * @param  {[type]}   index [description]
   * @param  {[type]}   tplId [description]
   * @return {[type]}         [description]
   */
  function showDialog(fn, index, tplId){
    var tmp = varnishList[index];
    var obj = angular.element(angular.element(tplId).html());
    fn(tmp.ip, tmp.port).then(function(res){
      var tmpScope = $scope.$new(true);
      angular.extend(tmpScope, {
        status : 'show',
        modal : true,
        data : res.data
      });
      $compile(obj)(tmpScope);
      $element.append(obj);
      self.opList[index] = -1;
    }, function(res){
      self.opList[index] = -1;
      alert(res.data.error || '加载数据失败！');
    });
  }

};
fn.$inject = ['$scope', '$http', '$compile', '$element', 'debug', 'varnishService'];
angular.module('jtApp')
  .controller('VarnishPageController', fn);
})(this);