'use strict';
const config = require('./config');
const util = require('util');
const debug = require('./helpers/debug');

initServer(10000);
require('./helpers/monitor').run(60 * 1000);

function initServer(port) {
  const koa = require('koa');
  const mount = require('koa-mount');

  let app = koa();

  app.keys = config.keys;

  // http response默认为不缓存，并添加X-
  app.use(function *(next) {
    let ctx = this;
    let processList = ctx.headers['x-process'] || '';
    ctx.set('X-Process', processList + ', node-' + (process.env.NAME || 'unknown'));
    ctx.set('Cache-Control', 'must-revalidate, max-age=0');
    yield* next;
  });

  // healthy check
  app.use(mount('/ping', function *() {
    yield function(done) {
      setImmediate(done);
    };
    this.body = config.version;
  }));

  // http log for dev
  if(config.env === 'development'){
    app.use(require('koa-logger')());
  }
  app.use(require('koa-log')(config.processName));

  app.use(require('./middlewares/http-stats'));

  // 超时，单位ms
  let timeout = 30 * 1000;
  if (config.env === 'development') {
    timeout = 5 * 1000;
  }
  app.use(require('koa-timeout')(timeout));



  let staticParser;
  let maxAge = 30 * 24 * 3600;
  if (config.env === 'development') {
    staticParser = require('static-parser');
    maxAge = 0;
  }
  let serve = require('koa-static-serve')(config.staticPath, {
    maxAge : maxAge
  }, staticParser);

  app.use(mount(config.staticUrlPrefix, serve));

  // methodOverride(由于旧的浏览器不支持delete等方法)
  app.use(require('koa-methodoverride')());


  // bodyparser的处理
  app.use(require('koa-bodyparser')());


  // 从请求中的query中获取debug的相关参数
  app.use(require('./middlewares/debug')({
    DEBUG : '_debug',
    pretty : '_pretty',
    pattern : '_pattern',
    MOCK : '_mock'
  }));


  // 限制并发请求数
  app.use(require('koa-connection-limit')({
    mid : 100,
    high : 500
  }));


  // fresh的处理
  app.use(require('koa-fresh')());
  // etag的处理
  app.use(require('koa-etag')());


  // 添加常量或者一些工具方法到state中
  app.use(require('./middlewares/state')());


  if (config.appUrlPrefix) {
    app.use(mount(config.appUrlPrefix, require('./routes')));
  } else {
    app.use(require('./routes'));
  }


  app.on('error', function appOnError(err, ctx) {
    let str = util.format('code:%s, error:%s, stack:%s', err.code || '0', err.message, err.stack);
    console.error(str);
  });


  app.listen(port);
  console.info('server listen on:%s', port);
}
