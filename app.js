'use strict';
require('./init');
const config = localRequire('config');
const util = require('util');
const path = require('path');
const co = require('co');
const _ = require('lodash');
const globals = localRequire('globals');
const debug = localRequire('helpers/debug');
const urlJoin = require('url-join');
co(function *() {
  initApp();
  if (config.env !== 'development') {
    yield localRequire('helpers/consul').register();
  }
}).catch(function (err) {
  console.error('message:' + err.message + ', stack:' + err.stack);
});


/**
 * [initApp description]
 * @param  {[type]} argument [description]
 * @return {[type]}          [description]
 */
function initApp() {
  initServer();

  // mongodb 初始化连接
  let mongodbUri = globals.get('mongodb');
  if (mongodbUri) {
    initMongodb(mongodbUri);
  }


  // statsd 初始化
  let statsdConfig = globals.get('statsd');
  if (statsdConfig) {
    statsdConfig.prefix = statsdConfig.prefix || config.app;
    require('./helpers/sdc').init(statsdConfig);
  }


  // redis session初始化
  let redisConfig = globals.get('redis');
  if (redisConfig) {
    require('./middlewares/session').init(redisConfig, globals.get('config.session'));
  }


  // zipkin 初始化
  let zipkinConfig = globals.get('zipkin');
  if (zipkinConfig) {
    require('./helpers/zipkin').init(zipkinConfig);
  }


  require('./helpers/monitor').run(60 * 1000);
}


/**
 * [initServer description]
 * @return {[type]} [description]
 */
function initServer() {
  const koa = require('koa');
  const mount = require('koa-mount');
  let port = config.port;
  let appUrlPrefix = config.appUrlPrefix;
  let staticUrlPrefix = config.staticUrlPrefix;
  let app = koa();

  app.keys = ['secret_secret', 'i like io.js'];

  app.proxy = true;

  app.use(require('./middlewares/error'));

  // http response默认为不缓存，并添加X-
  app.use(function *(next) {
    /*jshint validthis:true */
    let ctx = this;

    let url = ctx.url;
    if (appUrlPrefix && url.substring(0, appUrlPrefix.length) === appUrlPrefix) {
      ctx.url = url.substring(appUrlPrefix.length) || '/';
    }

    let processList = ctx.headers['x-process'] || 'unknown';
    ctx.set('X-Process', processList + ', node-' + (process.env.HOSTNAME || 'unknown'));
    ctx.set('Cache-Control', 'must-revalidate, max-age=0');
    yield* next;
  });

  // healthy check
  app.use(mount('/ping', function *() {
    yield Promise.resolve();
    this.body = config.version;
  }));
  let logType = 'dev';
  if (config.env !== 'development') {
    logType = ':remote-addr - :cookie[' + config.trackKey + '] ":method :url HTTP/:http-version" :status :length ":referrer" ":user-agent"';
  }
  app.use(require('koa-log')(logType));

  app.use(require('./middlewares/http-stats')({
    time : [300, 500, 1000, 3000],
    size : [1024, 10240, 51200, 102400],
    cookie : [config.trackKey]
  }));

  // 超时，单位ms
  let timeout = 30 * 1000;
  if (config.env === 'development') {
    timeout = 5 * 1000;
  }
  // TODO:如果tiemout了，但是还有调用未完成，koa不会把数据返回给浏览器，这部分需要特别处理
  // app.use(require('koa-timeout')(timeout));

  // 限制并发请求数
  app.use(require('koa-connection-limit')({
    mid : 100,
    high : 500
  }));

  let staticParser;
  let maxAge = 30 * 24 * 3600;
  if (config.env === 'development') {
    staticParser = require('static-parser');
    maxAge = 0;
  }
  let serve = require('koa-static-serve')(config.staticPath, {
    maxAge : maxAge
  }, staticParser);
  app.use(mount(staticUrlPrefix, serve));

  // methodOverride(由于旧的浏览器不支持delete等方法)
  app.use(require('koa-methodoverride')());


  // bodyparser的处理
  app.use(require('koa-bodyparser')());


  // 从请求中的query中获取debug的相关参数
  app.use(require('./middlewares/debug')());

  // fresh的处理
  app.use(require('koa-fresh')());
  // etag的处理
  app.use(require('koa-etag')());

  // 添加常量或者一些工具方法到state中
  app.use(require('./middlewares/state')());

  app.use(require('./middlewares/picker')('_fields'));

  // 在middleware/error中已经处理了error的出错显示之类，因为绑定空函数，避免error的重复输出
  app.on('error', _.noop);



  app.use(require('./routes')());


  app.listen(port);
  console.info('server listen on:%s', port);
}

/**
 * [initMongodb description]
 * @return {[type]}     [description]
 */
function initMongodb(uri) {
  let modelPath = path.join(__dirname, 'models');
  require('./helpers/mongodb').init(uri, modelPath);

}
