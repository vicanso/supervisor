'use strict';
var debug = require('../helpers/debug');
var etcd = require('../services/etcd');
exports.view = view;

exports.save = save;

/**
 * [*save 保存backend配置]
 * @yield {[type]} [description]
 */
function *save(){
  var data = this.request.body;
  try{
    var result = yield etcd.addBackend(data);
  }catch(err){
    console.error(err);
  }
  this.body = {
    msg : 'success'
  };
}

/**
 * [*view 显示backend list]
 * @yield {[type]} [description]
 */
function *view(){
  var backendList = yield etcd.backendList();
  console.dir(backendList);
  this.state.viewData = {
    page : 'backend',
    backendList : backendList
  };
}