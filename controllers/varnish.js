'use strict';
var debug = require('../helpers/debug');
var etcd = require('../services/etcd');
module.exports = function *(){
  try{
    var varnishList = yield etcd.varnishList();
  }catch(err){
    console.error(err);
  }
  this.state.viewData = {
    page : 'varnish',
    varnishList : varnishList
  };
};