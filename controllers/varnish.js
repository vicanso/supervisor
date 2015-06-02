'use strict';
var debug = require('../helpers/debug');
var etcd = require('../services/etcd');
module.exports = function *(){
  var varnishList = yield etcd.varnishList();
  this.state.viewData = {
    page : 'varnish'
  };
};