'use strict';
var debug = require('../helpers/debug');
var etcd = require('../services/etcd');
module.exports = function *(){
  try{
    var varnishList = yield etcd.varnishList();
  }catch(err){
    console.error(err);
  }
  this.set('Cache-Control', 'public, max-age=60');
  this.state.viewData = {
    page : 'varnish',
    varnishList : varnishList
  };
};