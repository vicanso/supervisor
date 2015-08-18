'use strict';
const sdc = localRequire('helpers/sdc');
const zipkin = localRequire('helpers/zipkin');
const _ = require('lodash');
module.exports = httpStats;

/**
 * [httpStats 统计http请求数，当前处理数，请求处理时间]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function httpStats(options) {
  const timeArr = _.get(options, 'time');
  const sizeArr = _.get(options, 'size');
  const cookies = _.get(options, 'cookie');
  return function *httpStats(next) {
    /*jshint validthis:true */
    let ctx = this;
    let start = Date.now();
    let res = ctx.res;
    let onfinish = done.bind(null, 'finish');
    let onclose = done.bind(null, 'close');
    res.once('finish', onfinish);
    res.once('close', onclose);
    sdc.increment('http.processing');
    sdc.increment('http.processTotal');
    let result = zipkin.trace(ctx.method);
    let traceDone = result.done;
    delete result.done;
    ctx.zipkinTrace = result;
    function done(event){
      let use = Date.now() - start;
      sdc.decrement('http.processing');
      sdc.increment('http.status.' + ctx.status);
      // TODO 是否如果是出错的请求则不记录？
      sdc.timing('http.use', use);
      if (timeArr) {
        sdc.increment('http.timeLevel.' + _.sortedIndex(timeArr, use));
      }
      if (sizeArr) {
        sdc.increment('http.sizeLevel.' + _.sortedIndex(sizeArr, ctx.length));
      }
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
      let traceData = {
        status : ctx.status,
        uri : ctx.originalUrl
      };
      _.forEach(cookies, function(name) {
        let v = ctx.cookies.get(name);
        if (v) {
          traceData[name] = v;
        }
      });
      traceDone(traceData);
    }
    yield* next;
  };
}
