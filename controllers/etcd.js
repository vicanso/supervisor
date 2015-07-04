'use strict';
const etcd = require('../services/etcd');
const _ = require('lodash');
const debug = require('../helpers/debug');
const errors = require('../errors');
exports.view = view;
exports.get = get;
exports.del = del;
exports.add = add;
/**
 * [home description]
 * @return {[type]} [description]
 */
function *view(){
  /*jshint validthis:true */
  let ctx = this;
  let nodes = [];
  let err;
  try {
    nodes = yield etcd.list('');
  } catch (e) {
    err = e;
    console.error(e);
  }
  ctx.state.viewData = {
    page : 'etcd',
    name : 'vicanso',
    err : err,
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
  if (query.dir) {
    key += '?recursive=true';
  }
  let result = yield etcd.del(key);
  ctx.body = result;
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
