'use strict';
const globals = require('../globals');
let requestTotal = 0;
let handlingReqTotal = 0;
let responseTimeList = [];
module.exports = httpStats;

/**
 * [httpStats 统计http请求数，当前处理数，最近20次请求处理时间]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function *httpStats(next) {
  /*jshint validthis:true */
  let ctx = this;
  let start = Date.now();
  handlingReqTotal++;
  requestTotal++;
  let res = ctx.res;
  let onfinish = done.bind(null, 'finish');
  let onclose = done.bind(null, 'close');
  res.once('finish', onfinish);
  res.once('close', onclose);

  globals.set('http-stats', {
    handlingReqTotal : handlingReqTotal,
    requestTotal : requestTotal,
    responseTimeList : responseTimeList
  });
  function done(event){
    handlingReqTotal--;
    let use = Date.now() - start;
    responseTimeList.push(use);
    if (responseTimeList.length > 20) {
      responseTimeList.shift();
    }
    res.removeListener('finish', onfinish);
    res.removeListener('close', onclose);
  }
  yield* next;
}
