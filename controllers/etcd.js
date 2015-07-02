'use strict';
const etcd = require('../services/etcd');
const _ = require('lodash');
const debug = require('../helpers/debug');
const errors = require('../errors');
exports.view = view;
exports.get = get;

/**
 * [home description]
 * @return {[type]} [description]
 */
function *view(){
  /*jshint validthis:true */
  let ctx = this;
  let nodes = yield etcd.list();
  nodes = _.map(nodes, function (node) {
    let v = _.isUndefined(node.value)? '--' : node.value;
    let ttl = _.isUndefined(node.ttl)? '--' : node.ttl;
    return {
      key : node.key,
      value : v,
      dir : !!node.dir,
      ttl : ttl
    };
  });
  nodes = _.sortBy(nodes, function(node) {
    return node.key;
  });
  ctx.state.viewData = {
    page : 'etcd',
    name : 'vicanso',
    nodes : nodes
  };
}


/**
 * [get description]
 * @return {[type]} [description]
 */
function *get() {
  /*jshint validthis:true */
  let ctx = this;
  let key = _.get(ctx, 'query.key');
  if (!key) {
    throw errors.get(20, {
      params : ['key']
    });
  }
  let result = yield etcd.get(key);
  ctx.body = result;
}
