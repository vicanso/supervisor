'use strict';
var co = require('co');
var config = require('./config');
var _ = require('lodash');
var request = require('superagent');
var util = require('util');
var debug = require('./helpers/debug');
var path = require('path');

initServer(config.port);


/**
 * [startMonitor 启动监控]
 * @return {[type]} [description]
 */
function startMonitor(){
  var monitor = require('./helpers/monitor');
  monitor.run();
}

/**
 * [wrapOnError 替换koa context的onerror]
 * @param  {[type]} originalFn [description]
 * @return {[type]}            [description]
 */
function wrapOnError(context){
  var fn = context.onerror;

  context.onerror = function(err){
    if(err && err.data){
      var data = err.data;
      var res = this.res;
      var end = res.end;
      var self = this;
      this.res.end = function(){
        var msg = data;
        if(_.isObject(data)){
          msg = JSON.stringify(data);
          self.type = 'application/json';
        }
        self.length = Buffer.byteLength(msg);
        end.call(res, msg);
      };
    }
    fn.call(this, err);
  };
}


/**
 * [initServer 初始化服务器]
 * @param  {[type]} port [description]
 * @return {[type]}      [description]
 */
function initServer(port){
  var path = require('path');
  var koa = require('koa');
  var mount = require('koa-mount');
  var requireTree = require('require-tree');
  var middlewares = requireTree('./middlewares');
  var methodOverride = require('koa-methodoverride');
  var app = koa();

  wrapOnError(app.context);
  // 超时，单位ms
  var timeout = 30 * 1000;
  if(config.env === 'development'){
    timeout = 5 * 1000;
  }

  app.use(methodOverride());

  // 增加一个timeout的middleware
  app.use(require('koa-timeout')(timeout));
  

  // 配置当node同时在处理多少个请求时，输出warning，多少个时直接认为服务器繁忙
  app.use(middlewares.toobusy({
    mid : 100,
    high : 500
  }));

  // http response默认为不缓存
  app.use(function *(next){
    this.set('Cache-Control', 'must-revalidate, max-age=0');
    yield* next;
  });


  app.keys = config.keys;


  // 用于检测服务是否可用
  app.use(middlewares.ping('/ping'));

  // http log
  if(config.env === 'development'){
    app.use(require('koa-logger')());
  }

  // 在http response header中添加一些信息：用时、服务器当前处理的请求数等；
  app.use(middlewares.log(config.processName));

  // fresh的处理
  app.use(require('koa-fresh')());

  // etag的处理
  app.use(require('koa-etag')());

  // 静态文件的处理
  if(config.env === 'development'){
    var srcServe = middlewares.static(config.staticSrcPath, {
      maxAge : 0
    });
    app.use(mount(config.staticUrlPrefix, srcServe));
  }else{

    // debug时使用的非合并非压缩代码的静态文件路由 
    var srcServe = middlewares.static(config.staticSrcPath, {
      maxAge : 0
    });
    app.use(mount(config.staticUrlPrefix + '/src', srcServe));

    
    var serve = middlewares.static(config.staticDestPath, {
      // 单位秒
      maxAge : 365 * 24 * 3600
    });
    app.use(mount(config.staticUrlPrefix, serve));

    

  }

  // 添加常量或者一些工具方法到state中
  app.use(middlewares.state());


  // bodyparser的处理
  app.use(require('koa-bodyparser')());
  
  var debugParams = {
    DEBUG : '_debug',
    pretty : '_pretty',
    pattern : '_pattern'
  };
  // 从请求中的query中获取debug的相关参数，写到ctx.state中
  app.use(middlewares.debug(debugParams));

  // admin的middleware
  app.use(mount(config.appUrlPrefix + '/jt', middlewares.admin()));

  if(config.appUrlPrefix){
    app.use(mount(config.appUrlPrefix, require('./routes').router));
  }else{
    app.use(require('./routes').router);
  }
  
  app.on('error', function(err, ctx){
    var str = util.format('code:%s, error:%s, stack:%s', err.code || '0', err.message, err.stack)
    if(!err.data){
      console.error('[U-S]');
      console.error('url:' + ctx.request.originalUrl);
      console.error(str);
      console.error('[U-E]');
      // TODO
      // 记录未处理的error次数
      // 对请求判断是否支持什么类型的数据对应返回json html

    }else{
      console.error(str);
    }
  });

  app.listen(port);
  console.info('server listen on:%s', port);
}



