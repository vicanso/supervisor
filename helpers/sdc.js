'use strict';
const _ = require('lodash');
const util = require('util');
const config = require('../config');
let client = null;

exports.init = init;
exports.client = client;

_.forEach('gauge gaugeDelta set counter increment decrement timing'.split(' '), function (fn) {
  // 对statsd-client的方法做封装，判断如果没有初始化的时候，只输出log
  exports[fn] = function (name, value) {
    if (client) {
      client[fn](name, value);
    } else if (config.env === 'development') {
      let str = util.format('statsd %s %s', fn, name);
      if (!_.isUndefined(value)) {
        str += (' ' + value);
      }
      console.info(str);
    }
  };
});

/**
 * [init description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function init(options) {
  const SDC = require('statsd-client');
  client = new SDC(options);
}
