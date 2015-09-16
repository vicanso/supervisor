'use strict';
const winston = require('winston');
const config = localRequire('config');
const _ = require('lodash');
const path = require('path');
const mkdirp = require('mkdirp');
const util = require('util');
const dgram = require('dgram');



function init() {
  let transports = [];
  if (config.env === 'development') {
    transports.push(new(winston.transports.Console)({
      timestamp: true,
      colorize: true
    }));
    transports.push(new UDPLogger({
      timestamp: true,
      name: config.app
    }));
  } else {
    let logPath = '/var/log/' + config.app;
    mkdirp.sync(logPath);
    transports.push(new(winston.transports.File)({
      name: 'out-file',
      filename: path.join(logPath, 'out.log'),
      timestamp: true
    }));
    transports.push(new(winston.transports.File)({
      filename: path.join(logPath, 'err.log'),
      name: 'error-file',
      timestamp: true,
      level: 'error'
    }));
  }
  const logger = new(winston.Logger)({
    transports: transports
  });
  _.forEach(_.functions(console), function(fn) {
    if (_.isFunction(logger[fn])) {
      console[fn] = function() {
        logger[fn].apply(logger, arguments);
      };
    }
  });
}

function UDPLogger(options) {
  const url = require('url');
  let urlInfo = url.parse(config.udpLog);
  this.port = urlInfo.port;
  this.host = urlInfo.hostname;
  this.name = _.pad(options.name, 10);
  this.client = dgram.createSocket("udp4");
}
util.inherits(UDPLogger, winston.Transport);

UDPLogger.prototype.log = function(level, msg, meta, cb) {
  let str = this.name + (new Date()).toISOString() + ' ' + level + ':' +
    msg + '\n';
  let buf = new Buffer(str);
  this.client.send(buf, 0, buf.length, this.port, this.host, function(err) {
    if (err) {
      cb(err);
    } else {
      cb(null, true);
    }
  });
};


init();
