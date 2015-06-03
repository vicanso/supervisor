'use strict';
var config = require('../config');
var url = require('url');
var util = require('util');
var request = require('superagent');
var _ = require('lodash');
var etcdInfo = url.parse(config.etcdServer);
var etcdUrl = util.format('http://%s:%s/v2', etcdInfo.hostname, etcdInfo.port);
var parallel = require('co-parallel');
var debug = require('../helpers/debug');

exports.varnishList = varnishList;
exports.backendList = backendList;
exports.addBackend = addBackend;

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
    request.delete(etcdUrl + '/keys/' + key).end(done);
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
  var pingList = [];
  _.each(_.get(result, 'body.node.nodes'), function(item){
    var key = item.key.substring('/varnish/'.length);
    try{
      var v = JSON.parse(item.value);
      v.name = key;
      v.ttl = item.ttl;
      list.push(v)
      pingList.push(util.format('http://%s:%s/ping', v.ip, v.port));
    }catch(err){
      console.error(err);
    }
  });
  debug('varnish list:%j', list);
  function *ping(url){
    debug('ping url:%s', url);
    return yield function(done){
      request.get(url).end(done);
    };
  }

  var result = yield parallel(pingList.map(ping));

  console.dir(list);
  console.dir(pingList);
  console.dir(result);


// var request = require('co-request');
// var co = require('co');

// var urls = [
//   'http://google.com',
//   'http://yahoo.com',
//   'http://ign.com',
//   'http://cloudup.com',
//   'http://myspace.com',
//   'http://facebook.com',
//   'http://segment.io'
// ];

// function *status(url) {
//   console.log('GET %s', url);
//   return (yield request(url)).statusCode;
// }

// co(function *(){
//   var reqs = urls.map(status);
//   var res = yield parallel(reqs, 2);
//   console.log(res);
// })();

}