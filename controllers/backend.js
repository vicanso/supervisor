'use strict';
const consul = localRequire('services/consul');
const request = require('superagent');
const util = require('util');
const parallel = require('co-parallel');
const _ = require('lodash');
const debug = localRequire('helpers/debug');
module.exports = backend;

/**
 * [backend description]
 * @return {[type]} [description]
 */
function* backend() {
  /*jshint validthis:true */
  let ctx = this;
  let backends;
  let error;
  let backendTypeList = [
    'http-ping',
    'http-stats',
    'production',
    'test'
  ];
  let currentBackendType = 'http-ping';
  try {
    backends = yield consul.httpPingServices();
    backends = _.sortBy(backends, function(backend) {
      return backend.name;
    });
    let pingList = yield getPingResult(backends);
    _.map(backends, function(backend, i) {
      backend.ping = pingList[i];
    });
  } catch (err) {
    error = err;
    console.error(err);
  }


  ctx.set('Cache-Control', 'public, max-age=60');
  ctx.state.viewData = {
    page: 'backend',
    backends: backends,
    currentBackendType: currentBackendType,
    backendTypeList: backendTypeList,
    error: error
  };
}

function* getPingResult(backends) {
  let fns = backends.map(function(backend) {
    let url = util.format('http://%s:%s/ping', backend.ip,
      backend.port);
    debug('get ping %s', url);
    return new Promise(function(resolve, reject) {
      request.get(url).timeout(1000).end(function(err, res) {
        if (err) {
          console.error(err);
          resolve('unknown');
        } else {
          resolve(res.text);
        }
      });
    });
  });
  return yield parallel(fns);

}
