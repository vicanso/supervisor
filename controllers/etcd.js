'use strict';
const etcd = require('../helpers/etcd');
exports.view = view;
exports.list = list;
exports.add = add;
exports.del = del;


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
  let key = ctx.query.key;
  ctx.body = yield etcd.list(key);
}


function *add() {
  /*jshint validthis:true */
  let ctx = this;
  let data = ctx.request.body;
  let fn = 'update';
  if (data.dir) {
    fn = 'add';
  }
  let result = yield etcd[fn](data.key, data.value, data.ttl);
  ctx.body = result;
}


function *del() {
  /*jshint validthis:true */
  let ctx = this;
  let query = ctx.query;
  let key = query.key;
  if (query.dir) {
    key += '?dir=true';
  }
  ctx.body = yield etcd.del(key);
}
