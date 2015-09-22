'use strict';

exports.view = veiw;

/**
 * [veiw description]
 * @return {[type]} [description]
 */
function* veiw() {
  /*jshint validthis:true */
  let ctx = this;
  yield Promise.resolve();
  ctx.state.viewData = {
    name: 'vicanso',
    page: 'log'
  };
}
