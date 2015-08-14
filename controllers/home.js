'use strict';

module.exports = home;

/**
 * [home description]
 * @return {[type]} [description]
 */
function *home(){
  /*jshint validthis:true */
  let ctx = this;
  yield Promise.resolve();
  ctx.state.viewData = {
    name : 'vicanso'
  };
}
