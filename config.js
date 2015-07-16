'use strict';
const path = require('path');
const pkg = require('./package');

const env = process.env.NODE_ENV || 'development';

exports.env = env;

exports.version = process.env.APP_VERSION || 'unknown';

exports.etcdUrl = process.env.ETCD || 'http://localhost:4001';

exports.app = pkg.name;

exports.trackKey = '_track';

// 静态文件前缀
exports.staticUrlPrefix = '/static';
//静态文件源码目录
exports.staticPath = env === 'development'? path.join(__dirname, 'statics/src') : path.join(__dirname, 'statics/dest');

// view文件目录
exports.viewPath = path.join(__dirname, 'views');

exports.processName = (process.env.NAME || 'unknown') +  '-pm2-' + (process.env.pm_id || 'unknown');
