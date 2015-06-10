'use strict';
var debug = require('../helpers/debug');
var etcd = require('../services/etcd');
var util = require('util');
var _ = require('lodash');
var request = require('superagent');

exports.view = view;
exports.backends = backends;
/**
 * [*view description]
 * @yield {[type]} [description]
 */
function *view(){
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

function *backends(){
  var params = this.params;
  var url = util.format('http://%s:%s/v-servers', params.ip, params.port);
  // var res = yield function(done){
  //   request.get(url).timeout(3000).end(done);
  // };
  // var text = _.get(res, 'text');
  var text = 'supervisord,192.168.2.1,10000,,/supervisord|test,192.168.2.1,10001,,/test'
  if(text){
    this.set('Cache-Control', 'public, max-age=60');
    this.body = _.map(text.split('|'), function(str){
      var arr = str.split(',');
      var tmp = {
        name : arr[0],
        ip : arr[1],
        port : arr[2]
      }
      if(arr[3]){
        tmp.host = arr[3];
      }
      if(arr[4]){
        tmp.prefix = arr[4];
      }
      return tmp;
    });
  }else{
    this.body = null;
  }
  
  
}