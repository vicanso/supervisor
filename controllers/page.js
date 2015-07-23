'use strict';

exports.home = home;
exports.varnish = varnish;

/**
 * [home description]
 * @return {[type]} [description]
 */
function *home(){
  /*jshint validthis:true */
  let ctx = this;
  yield Promise.resolve();
  ctx.state.viewData = {
    name : 'vicanso',
    page : 'home'
  };
}



/**
 * [varnish description]
 * @return {[type]} [description]
 */
function *varnish(){
  /*jshint validthis:true */
  let ctx = this;
  yield Promise.resolve();
  ctx.state.viewData = {
    page : 'varnish'
  };
}
