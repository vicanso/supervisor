'use strict';
var debug = require('../helpers/debug');
var etcd = require('../services/etcd');

exports.view = view;

/**
 * [*view description]
 * @yield {[type]} [description]
 */
function *view(){
  var data = yield etcd.setting();
  this.set('Cache-Control', 'public, max-age=5');
  this.state.viewData = {
    page : 'setting'
  }
}