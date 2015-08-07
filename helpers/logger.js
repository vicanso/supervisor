'use strict';
const winston = require('winston');
const _ = require('lodash');
const logger = new (winston.Logger)({
  transports : [
    new (winston.transports.Console)({timestamp : true})
  ]
});
_.forEach(_.functions(console), function(fn){
  if (_.isFunction(logger[fn])) {
    console[fn] = function () {
      logger[fn].apply(logger, arguments);
    };
  }
});

exports.logger = logger;
