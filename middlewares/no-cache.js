'use strict';
const checker = require('koa-query-checker');
const noCacheQuery = checker('cache=false');
module.exports = noCache;

/**
 * [noCache nocahce的处理，主要为了避免varnish缓存了不应该缓存的请求，判断request header是否有Cache-Control:no-cache，如果没有，则redirect为当前url+ cache=false（query参数）]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function *noCache(next) {
  /*jshint validthis:true */
  let ctx = this;
  let method = ctx.method;
  if ((method !== 'GET' && method !== 'HEAD') || ctx.get('cache-control') === 'no-cache') {
    yield* next;
  } else {
    yield* noCacheQuery.call(this, next);
  }
}
