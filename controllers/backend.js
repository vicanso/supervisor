'use strict';
var debug = require('../helpers/debug');
var etcd = require('../services/etcd');
var request = require('superagent');
var parallel = require('co-parallel');
var util = require('util');
exports.view = view;
exports.save = save;
exports.remove = remove;

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
  function *getVersion(backend){
    return yield function(done){
      if(backend.category === 'web'){
        var url = util.format('http://%s:%s/ping', backend.ip, backend.port);
        request.get(url).timeout(3000).end(function(err, res){
          backend.version = res && res.text;
          done();
        });
      }else{
        setImmediate(done);
      }
    }
  }

  var backendList = yield etcd.backendList();
  yield parallel(backendList.map(getVersion));

  this.set('Cache-Control', 'public, max-age=10');
  this.state.viewData = {
    page : 'backend',
    backendList : backendList
  };
}


function *remove(){
  var params = this.params;
  var key = params.key + '/' + params.index;
  var result = yield etcd.deleteBackend(key);
  this.body = {
    msg : 'success'
  };
}