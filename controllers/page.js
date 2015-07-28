'use strict';

exports.home = home;

/**
 * [home description]
 * @return {[type]} [description]
 */
function *home(){
  /*jshint validthis:true */
  let ctx = this;
  yield Promise.resolve();
  ctx.set('Cache-Control', 'public, max-age=60');
  ctx.state.viewData = {
    name : 'vicanso',
    page : 'home'
  };
}
