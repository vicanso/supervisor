'use strict';
const winston = require('winston');
const _ = require('lodash');
const config = localRequire('config');
let transports = [
  new(winston.transports.Console)({
    timestamp: true
  })
];

if (config.env !== 'development') {
  transports.push(
    new(winston.transports.File)({
      name: 'file-log',
      filename: '/var/log/app.log',
      timestamp: true
    })
  );
  transports.push(
    new(winston.transports.File)({
      name: 'file-error',
      filename: '/var/log/app.err',
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
