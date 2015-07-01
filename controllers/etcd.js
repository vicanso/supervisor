'use strict';
const etcd = require('../services/etcd');
const _ = require('lodash');
exports.view = view;

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
