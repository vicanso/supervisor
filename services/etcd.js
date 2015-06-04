'use strict';
var config = require('../config');
var url = require('url');
var util = require('util');
var request = require('superagent');
var path = require('path');
var _ = require('lodash');
var etcdInfo = url.parse(config.etcdServer);
var etcdUrl = util.format('http://%s:%s/v2', etcdInfo.hostname, etcdInfo.port);
var parallel = require('co-parallel');
var debug = require('../helpers/debug');

exports.varnishList = varnishList;
exports.backendList = backendList;
exports.addBackend = addBackend;
exports.deleteBackend = deleteBackend;

/**
 * [*backendList 获取backend list]
 * @yield {[type]} [description]
 */
function *backendList(){
  var nodes;
  try{
    var result = yield function(done){
      request.get(etcdUrl + '/keys/backend').end(done);
    };
    nodes = _.get(result, 'body.node.nodes');
  }catch(err){
    console.error(err);
  }
  nodes = _.map(nodes, function(tmp){
    var data;
    try{
      data = JSON.parse(tmp.value);
      data.key = tmp.key
    }catch(err){
      console.error(err);
    }
    return data;
  });
  
  return _.uniq(nodes);
}

/**
 * [*addBackend 添加backend服务器]
 * @yield {[type]} [description]
 */
function *addBackend(data){
  return yield function(done){
    request.post(etcdUrl + '/keys/backend')
      .send('value=' + JSON.stringify(data))
      .end(done);
  }
}


function *deleteBackend(key){
  return yield function(done){
    var url = path.join(etcdUrl, 'keys', key);
    request.del(etcdUrl + '/keys/' + key).end(done);
  }
}

/**
 * [*varnishList 获取varnish服务器列表的信息]
 * @yield {[type]} [description]
 */
function *varnishList(){
  var result = yield function(done){
    request.get(etcdUrl + '/keys/varnish').end(done);
  };
  var list = [];
  _.each(_.get(result, 'body.node.nodes'), function(item){
    var key = item.key.substring('/varnish/'.length);
    try{
      var v = JSON.parse(item.value);
      v.name = key;
      v.ttl = item.ttl;
      v.ping = util.format('http://%s:%s/ping', v.ip, v.port);
      list.push(v)
    }catch(err){
      console.error(err);
    }
  });
  debug('varnish list:%j', list);
  function *ping(varnishServer){
    return yield function(done){
      varnishServer.ping = 'http://192.168.2.1:10001/ping'
      request.get(varnishServer.ping).end(function(err, res){
        var txt = _.get(res, 'res.statusMessage');
        if(txt){
          var arr = txt.split(' ');
          varnishServer.createdAt = arr[0];
          varnishServer.version = arr[1];
        }
        done();
      });
    };
  }

  yield parallel(list.map(ping));
  return list;
}