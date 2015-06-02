'use strict';
var os = require('os');
var util = require('util');
var _ = require('lodash');
var config = require('../config');
var debug = require('../helpers/debug');
/**
 * [exports 添加信息到response header]
 * @param  {[type]} processName [description]
 * @return {[type]}             [description]
 */
module.exports = function(processName){
  var requestTotal = 0;
  var handlingReqTotal = 0;
  var hostname = os.hostname();
  var pid = process.pid;
  debug('processName:%s, hostname:%s, pid:%s', processName, hostname, pid);
  return function *(next){
    var start = Date.now();
    handlingReqTotal++;
    var index = ++requestTotal;
    var ctx = this;
    var res = this.res;
    var renderTimeConsuming = 0;
    var onfinish = done.bind(null, 'finish');
    var onclose = done.bind(null, 'close');

    res.once('finish', onfinish);
    res.once('close', onclose);

    function done(event){
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
      var use = Date.now() - start;
      var ip = ctx.ips[0] || ctx.ip;
      var method = ctx.method;
      var url = ctx.request.url;
      var httpVersion = ctx.req.httpVersion;
      var header = ctx.request.header;
      var length = -1;
      if(!_.isUndefined(ctx.length)){
        length = ctx.length;
      }else{
        length = ctx.body && ctx.body.length;
      }
      var str = util.format('%s "%s %s HTTP/%s" %d %d %d-%dms "%s" "%s" %d-%d-%d', ip, method, url, httpVersion, ctx.status, length, renderTimeConsuming, use, header.referer || '', header['user-agent'], handlingReqTotal, index, requestTotal);
      handlingReqTotal--;
      if(config.env !== 'development'){
        console.info(str);
      }
    }
    yield* next;
    var use = Date.now() - start;
    if(ctx._renderTimeConsuming){
      renderTimeConsuming = ctx._renderTimeConsuming;
    }
    var jtInfo = util.format('%s,%s,%d,%d,%d,%d,%d,%d', hostname, processName, pid, handlingReqTotal, requestTotal, renderTimeConsuming, use, Date.now());
    ctx.set('JT-Info', jtInfo);
  };
};