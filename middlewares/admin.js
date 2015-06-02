'use strict';
var co = require('co');
var router = require('koa-router')();
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var config = require('../config');
var versionFile = path.join(__dirname, '../version');
var pm2 = require('../helpers/pm2');


module.exports = function(){
  router.get('/infos', validate, allInfos);
  return router.routes();;
};

/**
 * [validate 判断是否有权限]
 * @return {[type]} [description]
 */
function *validate(next){
  var crypto = require('crypto');
  var key = this.query.key;
  var shasum = crypto.createHash('sha1');
  if(!key || config.token !== shasum.update(key).digest('hex')){
    this.status = 401;
    this.body = 'Unauthorized';
  }else{
    yield* next;
  }
}

/**
 * [allInfos 响应http请求，返回当前pm2相关的进程信息]
 * @return {[type]} [description]
 */
function *allInfos(){
  var processInfos = yield pm2.list();
  var codeVersion = yield function(done){
    fs.readFile(versionFile, 'utf8', done);
  };
  _.forEach(processInfos, function(info){
    info.codeVersion = codeVersion;
  });
  this.body = processInfos;
}
