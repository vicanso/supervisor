'use strict';
const consul = require('../services/consul');
const request = require('superagent');
const util = require('util');
const parallel = require('co-parallel');
module.exports = backend;

/**
 * [backend description]
 * @return {[type]} [description]
 */
function *backend(){
  /*jshint validthis:true */
  let ctx = this;

  let backends = yield consul.httpPingServices();
  console.dir(backends);
  let fns = backends.map(function (backend) {
    let url = util.format('http://%s:%s/ping', backend.ServiceAddress, backend.ServicePort);
    return new Promise(function(resolve, reject) {
      request.get(url).end(function (ree, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res.text);
        }
      });
    });
  });
  let result = yield parallel(fns);
  console.dir(result);
  ctx.state.viewData = {
    name : 'vicanso'
  };
}
