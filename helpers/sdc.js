'use strict';
const _ = require('lodash');
const util = require('util');
const config = localRequire('config');
var client = null;

exports.init = init;
exports.client = client;


_.forEach('gauge gaugeDelta set counter increment decrement timing'.split(' '),
  function(fn) {
    // 对statsd-client的方法做封装，判断如果没有初始化的时候，只输出log
    exports[fn] = function(name, value) {
      if (client) {
        client[fn](name, value);
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
