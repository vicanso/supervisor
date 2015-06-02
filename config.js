'use strict';
var path = require('path');
var pkg = require('./package');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

exports.port = 10000;

exports.env = env;

exports.appUrlPrefix = env === 'development'? '/supervisor' : '/supervisor';

//静态文件源码目录
exports.staticSrcPath = path.join(__dirname, 'statics/src');
// 静态文件目录
exports.staticDestPath = path.join(__dirname, 'statics/dest');
// 静态文件url前缀
exports.staticUrlPrefix = exports.appUrlPrefix + '/static';

exports.staticHosts = env === 'development'? null : null;

// 用于admin的验证
exports.token = '6a3f4389a53c889b623e67f385f28ab8e84e5029';

// view文件目录
exports.viewPath = path.join(__dirname, 'views');

exports.sessionKey = 'vicanso';

exports.uuidKey = 'jtuuid';

exports.keys = [exports.sessionKey, exports.uuidKey];

exports.etcdServer = 'etcd://vicanso.com:4001';

exports.redisOptions = {
  ttl : 3600 * 1000,
  key : exports.sessionKey
};

exports.app = pkg.name;

exports.processName = 'pm2-' + (process.env.pm_id || '');