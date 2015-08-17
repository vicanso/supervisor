'use strict';
const request = require('superagent');
const fs = require('fs');
const config = require('../config');
const urlJoin = require('url-join');
const util = require('util');
const _ = require('lodash');

exports.register = register;
exports.get = get;
exports.put = put;

/**
 * [register 注册服务]
 * @return {[type]} [description]
 */
function *register() {
  let hostName = process.env.HOSTNAME;
  let hosts = fs.readFileSync('/etc/hosts', 'utf8');
  // etc hosts中的ip都是正常的，因此正则的匹配考虑的简单一些
  let reg = new RegExp('((?:[0-9]{1,3}\.){3}[0-9]{1,3})\\s*' + hostName);
  let address = _.get(reg.exec(hosts), 1);
  if (!address) {
    throw new Error('can not get address');
  }
  let tags = ['http-backend', config.env];
  if (config.appUrlPrefix) {
    tags.push('prefix:' + config.appUrlPrefix);
  }
  tags.push('http-ping');
  let registerData = {
    Node : hostName,
    Address : address,
    Service : {
      ID : hostName,
      Service : config.app,
      Port : config.port,
      Address : address,
      tags : _.uniq(tags)
    }
  };

  yield put('/v1/catalog/register', registerData);
}

/**
 * [get description]
 * @param  {[type]} url [description]
 * @return {[type]}     [description]
 */
function *get(url) {
  url = urlJoin(config.consul, url);
  return yield new Promise(function(resolve, reject) {
    request.get(url).end(function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * [put description]
 * @param  {[type]} argument [description]
 * @return {[type]}          [description]
 */
function *put(url, data) {
  url = urlJoin(config.consul, url);
  return yield new Promise(function(resolve, reject) {
    request.put(url).send(data).end(function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
