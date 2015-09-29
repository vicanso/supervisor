'use strict';
const request = require('superagent');
const fs = require('fs');
const config = localRequire('config');
const urlJoin = require('url-join');
const util = require('util');
const _ = require('lodash');
const consulInfo = require('url').parse(config.consul);
const ConsulClient = require('consul-simple-client');
const consul = new ConsulClient({
  host: consulInfo.hostname,
  port: consulInfo.port
});

exports.register = register;
exports.httpPingServices = httpPingServices;
exports.varnishServices = varnishServices;
exports.udpLogServices = udpLogServices;
exports.httpStatsServices = httpStatsServices;
exports.deregister = deregister;


function* deregister(node) {
  return yield consul.deregister(node);
}


/**
 * [register 注册服务]
 * @return {[type]} [description]
 */
function* register() {
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
  tags.push('http-ping', 'http-stats');
  yield consul.register({
    id: hostName,
    service: config.app,
    address: address,
    port: config.port,
    tags: _.uniq(tags)
  });
}

/**
 * [httpPingServices description]
 * @return {[type]} [description]
 */
function* httpPingServices() {
  return yield consul.listByTags('http-ping');
}

/**
 * [varnishServices description]
 * @return {[type]} [description]
 */
function* varnishServices() {
  return yield consul.listByTags('varnish');
}

/**
 * [udpLogServices description]
 * @return {[type]} [description]
 */
function* udpLogServices() {
  return yield consul.listByTags('udp-log');
}


/**
 * [httpStatsServices description]
 * @param  {[type]} argument [description]
 * @return {[type]}          [description]
 */
function* httpStatsServices() {
  return yield consul.listByTags('http-stats');
}
