'use strict';
var errors = require('../errors');
/**
 * [exports 用于控制http的请求数，当超于某个值的时候，直接返回too busy error]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
module.exports = function(options){
  // 超过mid则输出警告
  // 超过high直接返回error
  var mid = options.mid;
  var high = options.high;
  if(!mid || !high){
    throw new Error('mid and high can not be null');
  }
  var handlingReqTotal = 0;
  return function *(next){
    handlingReqTotal++;
    if(handlingReqTotal > high){
      throw errors.get(1);
    }
    if(handlingReqTotal > mid){
      console.warn('request achieve %d', handlingReqTotal);
    }
    var res = this.res;
    var onfinish = done.bind(null, 'finish');
    var onclose = done.bind(null, 'close');
    res.once('finish', onfinish);
    res.once('close', onclose);
    function done(event){
      handlingReqTotal--;
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
    }
    yield* next;
  }
};