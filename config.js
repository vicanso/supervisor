'use strict';
const path = require('path');
const pkg = require('./package');

const env = process.env.NODE_ENV || 'development';

// app前缀，用于相同host下以不同前缀区分站点
exports.appUrlPrefix = env === 'development'? '' : '/timtam';

exports.staticUrlPrefix = exports.appUrlPrefix + '/static';

//静态文件源码目录

exports.staticPath = env === 'development'? path.join(__dirname, 'statics/src') : path.join(__dirname, 'statics/dest');

exports.env = env;

exports.version = process.env.APP_VERSION || 'unknown';

exports.sessionKey = 'vicanso';

exports.token = '6a3f4389a53c889b623e67f385f28ab8e84e5029';

exports.uuidKey = 'jtuuid';

exports.keys = [exports.sessionKey, exports.uuidKey];

// view文件目录
exports.viewPath = path.join(__dirname, 'views');

exports.app = pkg.name;

exports.processName = (process.env.NAME || 'unknown') +  '-pm2-' + (process.env.pm_id || 'unknown');
