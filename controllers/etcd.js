'use strict';

exports.view = view;

/**
 * [home description]
 * @return {[type]} [description]
 */
function *view(){
  /*jshint validthis:true */
  let ctx = this;
  yield Promise.resolve();
  ctx.state.viewData = {
    page : 'etcd'
  };
}
