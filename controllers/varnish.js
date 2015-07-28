'use strict';
const etcd = require('../helpers/etcd');
const parallel = require('co-parallel');
const request = require('superagent');
const util = require('util');
const _ = require('lodash');
const httpRequest = require('../helpers/http-request');
exports.view = view;
exports.list = list;

/**
 * [view description]
 * @return {[type]} [description]
 */
function *view(){
  /*jshint validthis:true */
  let ctx = this;
  yield Promise.resolve();
  ctx.set('Cache-Control', 'public, max-age=60');
  ctx.state.viewData = {
    page : 'varnish'
  };
}


/**
 * [list description]
 * @return {[type]} [description]
 */
function *list() {
  /*jshint validthis:true */
  let ctx = this;
  let query = ctx.query;
  let arr = yield etcd.list(query.key);
  let fns = arr.map(getVarnishInfo);
  ctx.set('Cache-Control', 'public, max-age=10');
  ctx.body = yield parallel(fns);
}


/**
 * [getVarnishInfo description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function *getVarnishInfo(options) {
  let config = _.pick(options.value, ['host', 'port']);
  let url = util.format('http://%s:%s/ping', config.host, config.port);
  let res = yield httpRequest.get(url);
  let arr = res.text.split(' ');
  config.updatedAt = arr[0];
  config.version = arr[1];

  url = util.format('http://%s:%s/v-vcl', config.host, config.port);
  res = yield httpRequest.get(url);
  config.vcl = res.text;
  return config;
}



// var urls = [
//   'http://google.com',
//   'http://yahoo.com',
//   'http://ign.com',
//   'http://cloudup.com',
//   'http://myspace.com',
//   'http://facebook.com',
//   'http://segment.io'
// ];
//
// function *status(url) {
//   console.log('GET %s', url);
//   return (yield request(url)).statusCode;
// }
//
// co(function *(){
//   var reqs = urls.map(status);
//   var res = yield parallel(reqs, 2);
//   console.log(res);
// })();
