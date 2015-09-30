'use strict';
const config = localRequire('config');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const v8 = require('v8');
const bytes = require('bytes');
const moment = require('moment');
const toobusy = require('toobusy-js');
const util = require('util');
const spawn = require('child_process').spawn;
const globals = localRequire('globals');
exports.version = version;
exports.stats = stats;
exports.restart = restart;
exports.statistics = statistics;
exports.httpLog = httpLog;
exports.exception = exception;
exports.pause = pause;
exports.resume = resume;

/**
 * [version 返回代码版本与执行版本]
 * @return {[type]} [description]
 */
function* version() {
  /*jshint validthis:true */
  let ctx = this;
  let data = yield getVersion();
  ctx.set('Cache-Control', 'public, max-age=5');
  ctx.body = data;
}

/**
 * [getVersion 获取代码版本与运行版本]
 * @return {[type]} [description]
 */
function getVersion() {
  return new Promise(function (resolve, reject) {
    fs.readFile(path.join(__dirname, '../package.json'), function (err,
      data) {
      if (err) {
        reject(err);
      } else {
        let json = JSON.parse(data);
        data = {
          code: json.appVersion,
          exec: config.version
        };
        resolve(data);
      }
    });
  });
}

/**
 * [restart 重启pm2]
 * @return {[type]} [description]
 */
function* restart() {
  /*jshint validthis:true */
  let ctx = this;
  globals.set('status', 'pause');
  yield Promise.resolve();
  let str = util.format('%s will restart soon.', config.app);
  console.info(str);
  ctx.body = null;
  checkToRestart(2);
}

/**
 * [pause description]
 * @return {[type]} [description]
 */
function* pause() {
  /*jshint validthis:true */
  let ctx = this;
  globals.set('status', 'pause');
  let str = util.format('%s will pause.', config.app);
  console.info(str);
  yield Promise.resolve();
  ctx.body = null;
}

/**
 * [resume description]
 * @return {[type]} [description]
 */
function* resume() {
  /*jshint validthis:true */
  let ctx = this;
  globals.set('status', 'running');
  let str = util.format('%s will resume.', config.app);
  console.info(str);
  yield Promise.resolve();
  ctx.body = null;
}

/**
 * [stats 返回系统相关信息]
 * @return {[type]} [description]
 */
function* stats() {
  /*jshint validthis:true */
  let ctx = this;
  let version = yield getVersion();
  let heap = v8.getHeapStatistics();
  _.forEach(heap, function (v, k) {
    heap[k] = bytes(v);
  });

  function formatTime(seconds) {
    let str = '';
    let day = 24 * 3600;
    let hour = 3600;
    let minute = 60;
    // day hour minute seconds
    let arr = [0, 0, 0, 0];
    if (seconds > day) {
      arr[0] = Math.floor(seconds / day);
      seconds %= day;
    }
    if (seconds > hour) {
      arr[1] = Math.floor(seconds / hour);
      seconds %= hour;
    }
    if (seconds > minute) {
      arr[2] = Math.floor(seconds / minute);
      seconds %= minute;
    }
    arr[3] = seconds;
    return arr[0] + 'd' + arr[1] + 'h' + arr[2] + 'm' + arr[3] + 's';
  }

  let uptime = Math.ceil(process.uptime());
  let performance = globals.get('performance');
  if (performance.http) {
    performance.http.resSizeTotalDesc = bytes(performance.http.resSizeTotal);
  }

  let result = _.extend({
    version: version,
    uptime: formatTime(uptime),
    startedAt: new Date(Date.now() - uptime * 1000).toISOString()
  }, performance);
  ctx.set('Cache-Control', 'public, max-age=5');
  ctx.body = result;
}


/**
 * [statistics description]
 * @return {[type]} [description]
 */
function* statistics() {
  /*jshint validthis:true */
  let ctx = this;
  let data = ctx.request.body;
  console.info(JSON.stringify(data));
  let timing = data.timing;
  if (timing) {
    let result = {
      loadEvent: timing.loadEventEnd - timing.loadEventStart,
      domContentLoadedEvent: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
      response: timing.responseEnd - timing.responseStart,
      firstByte: timing.responseStart - timing.requestStart,
      connect: timing.connectEnd - timing.connectStart,
      domainLookup: timing.domainLookupEnd - timing.domainLookupStart,
      fetch: timing.responseEnd - timing.fetchStart,
      request: timing.responseEnd - timing.requestStart,
      dom: timing.domComplete - timing.domLoading
    };
  }
  yield Promise.resolve();
  ctx.body = null;
}


/**
 * [httpLog description]
 * @param  {[type]} argument [description]
 * @return {[type]}          [description]
 */
function* httpLog() {
  /*jshint validthis:true */
  let ctx = this;
  let ua = ctx.get('user-agent');
  let data = ctx.request.body;
  let ip = ctx.ips[0] || ctx.ip;
  if (data) {
    let log = 'ip:' + ip + ', ua:' + ua;
    _.forEach(data.success, function (tmp) {
      console.info('%s, url:%s, method:%s, use:%d', log, tmp.url, tmp.method,
        tmp.use);
    });

    _.forEach(data.error, function (tmp) {
      console.error('%s, url:%s, method:%s, status:%d, use:%d', log, tmp.url,
        tmp.method, tmp.status, tmp.use);
    });
  }
  yield Promise.resolve();
  ctx.body = null;
}

function* exception(argument) {
  /*jshint validthis:true */
  let ctx = this;
  let ua = ctx.get('user-agent');
  let data = ctx.request.body;
  console.error('exception, ua:%s, data:%s', ua, JSON.stringify(data));
  yield Promise.resolve();
  ctx.body = null;
}

/**
 * [checkToRestart 判断是否还有连接，如果无则重启]
 * @param  {[type]} times [description]
 * @return {[type]}       [description]
 */
function checkToRestart(times) {
  if (!times) {
    process.exit();
    return;
  }
  let timer = setTimeout(function () {
    let connectingTotal = globals.get('connectingTotal');
    if (!connectingTotal) {
      process.exit();
      return;
    }
    checkToRestart(--times);
  }, 15 * 1000);
  timer.unref();
}
