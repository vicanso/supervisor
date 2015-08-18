'use strict';
const consul = localRequire('helpers/consul');
const _ = require('lodash');
const parallel = require('co-parallel');

exports.httpPingServices = httpPingServices;

function *httpPingServices() {
  let res = yield consul.get('/v1/catalog/services');
  let services = [];
  _.forEach(res.body, function (tags, name) {
    if (_.indexOf(tags, 'http-ping') !== -1) {
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
