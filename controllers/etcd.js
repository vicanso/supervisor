'use strict';
const etcd = require('../services/etcd');
const _ = require('lodash');
const debug = require('../helpers/debug');
const errors = require('../errors');
exports.view = view;
exports.get = get;
exports.del = del;
/**
 * [home description]
 * @return {[type]} [description]
 */
function *view(){
  /*jshint validthis:true */
  let ctx = this;
  let nodes = yield etcd.list('');
  ctx.state.viewData = {
    page : 'etcd',
    name : 'vicanso',
    globals : {
      nodes : nodes
    }
  };
}


/**
 * [get description]
 * @return {[type]} [description]
 */
function *get() {
  /*jshint validthis:true */
  let ctx = this;
  let query = ctx.query;
  let fn = 'get';
  let key = query.key || '';
  if (query.dir) {
    fn = 'list';
  }
  let result = yield etcd[fn](key);
  ctx.body = result;
}

/**
 * [del description]
 * @return {[type]} [description]
 */
function *del(){
  /*jshint validthis:true */
  let ctx = this;
  let query = ctx.query;
  let key = query.key;
  let result = yield etcd.del(key);
  console.dir(result);
  ctx.body = result;
}
