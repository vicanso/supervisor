'use strict';
var config = require('../config');
var url = require('url');
var util = require('util');
var request = require('superagent');
var _ = require('lodash');
var etcdInfo = url.parse(config.etcdServer);
var ectdUrl = util.format('http://%s:%s/v2', etcdInfo.hostname, etcdInfo.port);
var parallel = require('co-parallel');
var debug = require('../helpers/debug');

exports.varnishList = varnishList;

/**
 * [*varnishList 获取varnish服务器列表的信息]
 * @yield {[type]} [description]
 */
function *varnishList(){
  var result = yield function(done){
    request.get(ectdUrl + '/keys/varnish').end(done);
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

      v.ip = '120.24.102.161';

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