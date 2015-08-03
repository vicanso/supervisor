'use strict';
const etcd = require('../helpers/etcd');
const parallel = require('co-parallel');
const request = require('superagent');
const util = require('util');
const _ = require('lodash');
const Joi = require('joi');
const httpRequest = require('../helpers/http-request');
const debug = require('../helpers/debug');
exports.view = view;
exports.list = list;
exports.stats = stats;

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
  debug('varnish list query:%j', query);
  let arr = yield etcd.list(query.key);
  debug('varnish list:%j', arr);
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
  let config = _.pick(options.value, ['port', 'ip']);
  let ip = config.ip;
  let url = util.format('http://%s:%s/ping', ip, config.port);
  let res = yield httpRequest.get(url);
  let arr = res.text.split(' ');
  config.updatedAt = arr[0];
  config.version = arr[1];

  url = util.format('http://%s:%s/v-vcl', ip, config.port);
  res = yield httpRequest.get(url);
  config.vcl = res.text;

  res = yield etcd.list(arr[2]);
  config.backends = _.map(res, function (tmp) {
    return tmp.value;
  });
  return config;
}


/**
 * [stats description]
 * @return {[type]} [description]
 */
function *stats() {
  /*jshint validthis:true */
  let ctx = this;
  let schema = {
    ip : Joi.string().ip({
      version : ['ipv4', 'ipv6']
    }).required(),
    port : Joi.number().integer().required()
  };
  let params = Joi.validateThrow(ctx.params, schema);
  let url = util.format('http://%s:%s/v-stats', params.ip, params.port);
  let res = yield httpRequest.get(url);
  ctx.set('Cache-Control', 'public, max-age=10');
  ctx.status = res.status;
  ctx.body = res.body || res.text;
}
