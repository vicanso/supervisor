'use strict';
const sdc = localRequire('helpers/sdc');
const zipkin = localRequire('helpers/zipkin');
const _ = require('lodash');
const globals = localRequire('globals');

module.exports = httpStats;

/**
 * [httpStats 统计http请求数，当前处理数，请求处理时间]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function httpStats(options) {
  const cookies = _.get(options, 'cookie');
  const interval = options.interval || 30 * 60 * 1000;


  function getDesc(type, v) {
    let tmp = _.get(options, type);
    let index = _.sortedIndex(tmp.v, v);
    return tmp.desc[index];
  }

  function resetHttpPerformance() {
    let result = {
      createdAt: (new Date()).toISOString(),
      reqTotal: 0,
      resSizeTotal: 0
    };
    _.forEach(options, function(item, k) {
      if (_.isArray(item.v) && _.isArray(item.desc)) {
        let tmp = {};
        result[k] = tmp;
        _.forEach(item.desc, function(desc) {
          tmp[desc] = 0;
        });
      }
    });
    globals.set('performance.http-old', globals.get('performance.http'));
    globals.set('performance.http', result);
  }

  resetHttpPerformance();
  let timer = setInterval(resetHttpPerformance, interval);
  timer.unref();
  let connectingTotal = 0;
  return function* httpStats(next) {
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
    connectingTotal++;
    globals.set('connectingTotal', connectingTotal);

    function done(event) {
      let use = Date.now() - start;
      connectingTotal--;
      globals.set('connectingTotal', connectingTotal);
      // TODO 是否如果是出错的请求则不记录？
      sdc.timing('http.use', use);

      let httpPerformance = globals.get('performance.http');

      let statusDesc = getDesc('status', ctx.status);
      sdc.decrement('http.processing');
      if (statusDesc) {
        sdc.increment('http.status.' + statusDesc);
        httpPerformance.status[statusDesc]++;
      }

      let timeDesc = getDesc('time', use);
      if (timeDesc) {
        sdc.increment('http.timeLevel.' + timeDesc);
        httpPerformance.time[timeDesc]++;
      }
      let sizeDesc = getDesc('size', ctx.length);
      httpPerformance.resSizeTotal += ctx.length;
      if (sizeDesc) {
        sdc.increment('http.sizeLevel.' + sizeDesc);
        httpPerformance.size[sizeDesc]++;
      }
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
      let traceData = {
        status: ctx.status,
        uri: ctx.originalUrl
      };
      _.forEach(cookies, function(name) {
        let v = ctx.cookies.get(name);
        if (v) {
          traceData[name] = v;
        }
      });
      httpPerformance.reqTotal++;
      traceDone(traceData);
    }
    yield * next;
  };
}
