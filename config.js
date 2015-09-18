'use strict';
const path = require('path');
const url = require('url');
const pkg = localRequire('package');
const urlJoin = require('url-join');
const env = process.env.NODE_ENV || 'development';

exports.env = env;

exports.version = pkg.appVersion;


exports.app = pkg.name;

exports.port = env === 'development' ? 5000 : 80;

exports.trackKey = '_track';

exports.appUrlPrefix = env === 'development' ? '' : '/supervisor';

// 静态文件前缀
exports.staticUrlPrefix = '/static';
//静态文件源码目录
exports.staticPath = env === 'development' ? path.join(__dirname, 'statics/src') :
  path.join(__dirname, 'statics/dest');

// view文件目录
exports.viewPath = path.join(__dirname, 'views');

exports.processName = (process.env.NAME || 'unknown') + '-pm2-' + (process.env.pm_id ||
  'unknown');

exports.appSetting = {
  token: '6a3f4389a53c889b623e67f385f28ab8e84e5029',
  session: {
    ttl: 3600 * 1000,
    key: 'vicanso',
    cookie: {
      maxAge: null
    }
  }
};

exports.consul = process.env.CONSUL || 'http://localhost:8500';

exports.udpLog = url.parse(process.env.UDP_LOG || 'udp://localhost:6000');
