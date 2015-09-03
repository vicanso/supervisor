'use strict';
const winston = require('winston');
const _ = require('lodash');
const config = localRequire('config');
const mkdirp = require('mkdirp');
const path = require('path');

let transports = [
  new(winston.transports.Console)({
    timestamp: true
  })
];
if (config.env !== 'development') {
  let logPath = path.join('/var/log', config.app);
  mkdirp.sync(logPath);
  transports.push(
    new(winston.transports.File)({
      name: 'file-log',
      filename: path.join(logPath, 'out.log'),
      timestamp: true
    })
  );
  transports.push(
    new(winston.transports.File)({
      name: 'file-error',
      filename: path.join(logPath, 'err.log'),
      level: 'error',
      timestamp: true
    })
  );
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

exports.logger = logger;
