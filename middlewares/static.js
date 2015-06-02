'use strict';
var serve = require('koa-static');
var moment = require('moment');
var util = require('util');
var path = require('path');
var config = require('../config');
var fs = require('fs');
var co = require('co');
var debug = require('../helpers/debug');

/**
 * [exports 静态文件处理]
 * @param  {[type]} staticPath [静态文件所在目录]
 * @param  {[type]} options    [参数配置{maxAge : Number, mount : String}]
 * @return {[type]}            [description]
 */
module.exports = function(staticPath, options){

  var handler = serve(staticPath, {});
  options = options || {};
  var maxAge = options.maxAge;
  var mount = options.mount || '';
  var length = mount.length;
  var notFoundMaxAge = Math.min(maxAge, 300);
  debug('static path:%s, options:%j', staticPath, options);
  return function *(next){
    yield handler.call(this, next);
    // 开发环境下，请求到stylus等文件的处理
    if(config.env === 'development' && !this.body){
      var file = path.join(staticPath, this.request.url);
      var ext = path.extname(file);
      if(ext === '.css'){
        var data = yield parseStylus(file);
        this.body = data;
        this.set('Content-Type', 'text/css; charset=utf-8');
      }
    }
    if(this.body){
      var sMaxAge = Math.min(3600, maxAge);
      this.set({
        'Expires' : moment().add(maxAge, 'seconds').toString(),
        'Cache-Control' : util.format('public, max-age=%d, s-maxage=%d', maxAge, sMaxAge),
        'Vary' : 'Accept-Encoding'
      });
    }else{
      if(notFoundMaxAge){
        this.set({
          'Expires' : moment().add(notFoundMaxAge, 'seconds').toString(),
          'Cache-Control' : util.format('public, max-age=%d', notFoundMaxAge),
          'Vary' : 'Accept-Encoding'
        });
      }
      this.throw(404);
    }
  }
};

/**
 * [parseStylus 编译stylus]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
function *parseStylus(file){
  file = file.replace('.css', '.styl');
  var nib = require('nib');
  var stylus = require('stylus');
  var exists = yield function(done){
    fs.exists(file, function(exists){
      done(null, exists);
    });
  };
  if(!exists){
    return;
  }
  var data = yield function(done){
    fs.readFile(file, 'utf8', done);
  };

  var css = yield function(done){
    stylus(data).set('filename', file).use(nib()).render(done);
  };

  return css;
}