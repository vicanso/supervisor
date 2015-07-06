;(function(global){
'use strict';
var module = angular.module('jt.directive.widget', []);


module.directive('jtDialog', jtDialog);
/**
 * [jtDialog 弹出框]
 * @param  {[type]} $compile [description]
 * @return {[type]}          [description]
 */
function jtDialog($compile){
  function dlgLink(scope, element, attr){
    var mask;
    scope.$watch('status', function(v){
      if(v === 'hidden'){
        element.addClass('hidden');
      }else{
        showDialog();
      }
    });

    scope.destroy = function(){
      element.remove();
      if(mask){
        mask.remove();
      }
      scope.$destroy();
    };


    element.on('click', '.destroy', function(){
      scope.destroy();
    });

    element.on('keyup', function(e){
      if(e.keyCode === 0x0d && scope.submit){
        scope.submit();
      }
    });


    function centralize(){
      var width = element.outerWidth();
      var height = element.outerHeight();
      element.css({
        'margin-left' : -width / 2,
        'margin-top' : -height / 2
      });
    }

    /**
     * [showDialog 显示对话框]
     * @return {[type]} [description]
     */
    function showDialog(){
      element.removeClass('hidden');
      centralize();
      if(scope.modal){
        mask = angular.element('<div class="mask"></div>');
        element.after(mask);
      }
      element.find('input:first').focus();
    }
  }

  return {
    restrict : 'E',
    link : dlgLink
  };
}

jtDialog.$inject = ['$compile'];



module.directive('jtTable', jtTable);
/**
 * [jtTable description]
 * @param  {[type]} $compile [description]
 * @return {[type]}          [description]
 */
function jtTable($compile, $document){

  function fixedHead(scope, element){


    var head = element.find('thead');
    var cloneHead = head.clone();
    var thList = head.find('th');
    var cloneThList = cloneHead.find('th');
    angular.forEach(thList, function(dom, i){
      cloneThList.eq(i).width(angular.element(dom).outerWidth());
    });
    var offset = head.offset();
    var offsetHeight = 2 * head.height();
    var tableHeight = element.height();

    cloneHead.addClass('cloneHead').css('position', 'fixed').css({
      'z-index' : 1,
      left : offset.left,
      top : 0
    }).height(head.height()).width(head.width());
    cloneHead.hide().insertAfter(head);
    var isHidden = true;
    var fn = _.throttle(function(){
      var top = angular.element($document).scrollTop();
      if(top > offset.top && top < offset.top + tableHeight - offsetHeight){
        if(isHidden){
          cloneHead.show();
          isHidden = false;
        }
      }else if(!isHidden){
        cloneHead.hide();
        isHidden = true;
      }
    }, 30);

    angular.element($document).on('scroll', fn);
    scope.$on('$destroy', function(){

    });
    fn();
  }

  function tableLink(scope, element, attr){
    var type = attr.jtTable;
    if(type === 'fixedHead'){
      setTimeout(function(){
        fixedHead(scope, element);
      }, 1000);
    }
  }

  return {
    restrict : 'A',
    link : tableLink
  };
}
jtTable.$inject = ['$compile', '$document'];

})(this);
