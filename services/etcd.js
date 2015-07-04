'use strict';
const request = require('superagent');
const urlJoin = require('url-join');
const config = require('../config');
const _ = require('lodash');
exports.url = config.etcdUrl;
exports.timeout = 3000;
exports.add = add;
exports.get = get;
exports.del = del;
exports.update = update;
exports.list = list;
/**
 * [getUrl description]
 * @param  {[type]} tmp [description]
 * @return {[type]}     [description]
 */
function getUrl(tmpUrl) {
  return urlJoin(exports.url, 'keys', tmpUrl);
}


/**
 * [add description]
 * @param {[type]} key  [description]
 * @param {[type]} data [description]
 * @param {[type]} ttl  [description]
 */
function *add(key, data, ttl) {
  if (_.isObject(data)) {
    data = JSON.stringify(data);
  }
  let res = yield function(done) {
    let req = request.post(getUrl(key))
      .timeout(exports.timeout)
      .send('value=' + data);
    if (!_.isUndefined(ttl)) {
      req.send('ttl=' + ttl);
    }
    req.end(done);

  };
  return _.get(res, 'body');
}


/**
 * [get description]
 * @param  {[type]} key [description]
 * @param  {[type]} dir [description]
 * @return {[type]}     [description]
 */
function *get(key, dir) {
  let res = yield function (done) {
    request.get(getUrl(key))
      .timeout(exports.timeout)
      .end(done);
  };
  let data = _.get(res, 'body.node');
  data.value = JSON.parse(data.value);
  return data;
}


/**
 * [del description]
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
function *del(key) {
  let res = yield function(done) {
    console.dir(getUrl(key));
    request.del(getUrl(key))
      .timeout(exports.timeout)
      .end(done);
  };
  return _.get(res, 'body');
}


/**
 * [update description]
 * @param  {[type]} key  [description]
 * @param  {[type]} data [description]
 * @param  {[type]} ttl  [description]
 * @return {[type]}      [description]
 */
function *update(key, data, ttl) {
  if (_.isObject(data)) {
    data = JSON.stringify(data);
  }
  let res = yield function(done) {
    let req = request.put(getUrl(key))
      .timeout(exports.timeout)
      .send('value=' + data);
    if (!_.isUndefined(ttl)) {
      req.send('ttl=' + ttl);
    }
    req.end(done);
  };
  return _.get(res, 'body');
}


/**
 * [list description]
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
function *list(key) {
  let res = yield function (done) {
    request.get(getUrl(key))
      .timeout(exports.timeout)
      .end(done);
  };
  let data = _.get(res, 'body.node.nodes');
  _.forEach(data, function(tmp) {
    try {
      tmp.value = JSON.parse(tmp.value);
    } catch (err) {
      console.error(err);
    }
  });
  return data;
}
