'use strict';
const etcd = require('../helpers/etcd');
exports.view = view;
exports.list = list;

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


/**
 * [list description]
 * @return {[type]} [description]
 */
function *list() {
  /*jshint validthis:true */
  let ctx = this;
  let key = ctx.params.key;
  ctx.body = yield etcd.list(key);
}
