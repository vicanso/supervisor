'use strict';

module.exports = home;

/**
 * [home description]
 * @return {[type]} [description]
 */
function *home(){
  /*jshint validthis:true */
  let ctx = this;
  yield function(done) {
    setImmediate(done);
  };
  ctx.state.viewData = {
    page : 'home',
    name : 'vicanso'
  };
}
