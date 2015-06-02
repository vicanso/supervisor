'use strict';
var config = require('../config');
var _ = require('lodash');
var debug = require('../helpers/debug');
/**
 * [exports 将debug的相关参数写到state]
 * @return {[type]} [description]
 */
module.exports = function (params){
  params = params || {};
  debug('debug params:%j', params);
  return function *(next){
    var state = this.state;
    var query = this.query;
    _.forEach(params, function(v, k){
      if(_.has(query, v)){
        if(query[v]){
          state[k] = query[v];
        }else{
          state[k] = true;
        }
      }
    });
    if(config.env === 'development' && !state.pattern){
      state.pattern = '*';
    }
    yield* next;
  };
};