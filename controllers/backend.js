'use strict';
const consul = localRequire('services/consul');
const request = require('superagent');
const util = require('util');
const parallel = require('co-parallel');
const _ = require('lodash');
const moment = require('moment');
const debug = localRequire('helpers/debug');
exports.view = view;
exports.deregister = deregister;

function* deregister() {
  /*jshint validthis:true */
  let ctx = this;
  let id = ctx.params.id;

  ctx.body = null;
}

/**
 * [view description]
 * @return {[type]} [description]
 */
function* view() {
  /*jshint validthis:true */
  let ctx = this;
  let backends;
  let backendTypeList = [
    'http-ping',
    'http-stats',
    'production',
    'test'
  ];
  let currentBackendType = ctx.params.type || 'http-ping';
  let error;
  try {
    switch (currentBackendType) {
      case 'http-ping':
        backends = yield getPingBackends();
        break;
      case 'http-stats':
        backends = yield getStatsBackends();
        break;
      default:
        throw new Error(currentBackendType + ' is not support');
    }
  } catch (e) {
    error = e;
  } finally {

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

/**
 * [getPingBackends description]
 * @return {[type]} [description]
 */
function* getPingBackends() {
  let backends = yield consul.httpPingServices();
  let pingList = yield getPingResult(backends);
  _.map(backends, function(backend, i) {
    backend.ping = pingList[i];
  });
  debug('ping backends:%j', backends);
  return backends;
}


/**
 * [getPingResult description]
 * @param  {[type]} backends [description]
 * @return {[type]}          [description]
 */
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


/**
 * [getStatsBackends description]
 * @return {[type]} [description]
 */
function* getStatsBackends() {
  let backends = yield consul.httpStatsServices();
  let statsList = yield getStatsResult(backends);
  _.map(backends, function(backend, i) {
    backend.stats = statsList[i];
  });
  debug('ping backends:%j', backends);
  return backends;
}


/**
 * [getStatsResult description]
 * @param  {[type]} backends [description]
 * @return {[type]}          [description]
 */
function* getStatsResult(backends) {
  let fns = backends.map(function(backend) {
    let url = util.format('http://%s:%s/sys/stats', backend.ip,
      backend.port);
    debug('get stats %s', url);
    return new Promise(function(resolve, reject) {
      request.get(url).timeout(1000).end(function(err, res) {
        if (err) {
          console.error(err);
          // resolve({});
          resolve(httpStatsResult);
        } else {
          resolve(res.body);
        }
      });
    });
  });
  return yield parallel(fns);
}


var httpStatsResult = {
  "version": {
    "code": "2015-09-24T13:45:14.747Z",
    "exec": "2015-09-24T13:45:14.747Z"
  },
  "uptime": "0d0h50m46s",
  "startedAt": "2015-09-28T02:34:12.778Z",
  "http-old": {
    "createdAt": "2015-09-28T02:34:13.304Z",
    "reqTotal": 0,
    "resSizeTotal": 0,
    "time": {
      "puma": 0,
      "tiger": 0,
      "deer": 0,
      "rabbit": 0,
      "turtle": 0
    },
    "size": {
      "10KB": 0,
      "50KB": 0,
      "100KB": 0,
      "300KB": 0,
      "1MB": 0,
      ">1MB": 0
    },
    "status": {
      "10x": 0,
      "20x": 0,
      "30x": 0,
      "40x": 0,
      "50x": 0
    }
  },
  "http": {
    "createdAt": "2015-09-28T03:04:13.306Z",
    "reqTotal": 0,
    "resSizeTotal": 0,
    "time": {
      "puma": 0,
      "tiger": 0,
      "deer": 0,
      "rabbit": 0,
      "turtle": 0
    },
    "size": {
      "10KB": 0,
      "50KB": 0,
      "100KB": 0,
      "300KB": 0,
      "1MB": 0,
      ">1MB": 0
    },
    "status": {
      "10x": 0,
      "20x": 0,
      "30x": 0,
      "40x": 0,
      "50x": 0
    },
    "resSizeTotalDesc": "0B"
  },
  "route-old": {
    "createdAt": "2015-09-28T02:34:13.913Z"
  },
  "route": {
    "createdAt": "2015-09-28T03:04:13.915Z",
    "GET/sys/stats": 1
  }
};
