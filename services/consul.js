'use strict';
const consul = localRequire('helpers/consul');
const _ = require('lodash');
const parallel = require('co-parallel');

exports.httpPingServices = httpPingServices;
exports.varnishServices = varnishServices;

/**
 * [httpPingServices description]
 * @return {[type]} [description]
 */
function *httpPingServices() {
  return yield getServiceByTag('http-ping');
}

/**
 * [getVarnishServices description]
 * @return {[type]} [description]
 */
function *varnishServices() {
  return yield getServiceByTag('varnish');
}

/**
 * [getServiceByTag description]
 * @param  {[type]} tag [description]
 * @return {[type]}     [description]
 */
function *getServiceByTag(tag) {
  let res = yield consul.get('/v1/catalog/services');
  let services = [];
  _.forEach(res.body, function (tags, name) {
    if (_.indexOf(tags, tag) !== -1) {
      services.push(name);
    }
  });
  let fns = services.map(function (service) {
    return consul.get('/v1/catalog/service/' + service);
  });
  let result = yield parallel(fns);
  result = _.map(result, function (res) {
    return res.body;
  });
  return _.flattenDeep(result);
}
