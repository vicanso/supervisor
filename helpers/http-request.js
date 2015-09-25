'use strict';
const request = require('superagent');
const _ = require('lodash');
const util = require('util');
const sdc = localRequire('helpers/sdc');

exports.get = get;
exports.timeout = 10 * 1000;
var processing = 0;
var processedTotal = 0;
/**
 * [get 请求数据]
 * @param  {[type]} url     [description]
 * @param  {[type]} headers [description]
 * @return {[type]}         [description]
 */
function* get(url, headers) {
  let req = request.get(url);
  _.forEach(headers, function(v, k) {
    req.set(k, v);
  });
  return yield handle(req);
}


/**
 * [handle description]
 * @param  {[type]} req [description]
 * @return {[type]}     [description]
 */
function* handle(req) {
  let res = {};
  let start = Date.now();
  processing++;
  processedTotal++;
  sdc.increment('request.processing');
  try {
    res = yield new Promise(function(resolve, reject) {
      req.timeout(exports.timeout).end(function(err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  } catch (err) {
    err.type = 'http-request';
    err.extra = req.url;
    throw err;
  } finally {
    processing--;
    let statusCode = res.statusCode || 0;
    let length = _.get(res, 'headers.content-length') || _.get(res,
      'text.length') || 0;
    let use = Date.now() - start;
    let str = util.format('request "%s %s" %d %d %dms %d-%d', req.method, req
      .url, statusCode, length, use, processing, processedTotal);

    sdc.decrement('request.processing');
    sdc.increment('request.status.' + statusCode);
    sdc.timing('request.use', use);
    console.info(str);
  }

  return res;
}
