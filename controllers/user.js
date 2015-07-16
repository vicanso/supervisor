'use strict';
const errors = require('../errors');
const user = require('../services/user');
const _ = require('lodash');
const uuid = require('node-uuid');
const crypto = require('crypto');
const zipkin = require('../helpers/zipkin');
const config = require('../config');
exports.get = get;
exports.create = create;
exports.login = login;
exports.logout = logout;
exports.encrypt = encrypt;
/**
 * [pick description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function pick(data) {
  let keys = ['account', 'name', 'lastLoginedAt', 'loginTimes', 'anonymous', 'hashCode'];
  return _.pick(data, keys);
}

/**
 * [get 从session中获取用户信息]
 * @return {[type]} [description]
 */
function *get(){
  /*jshint validthis:true */
  let ctx = this;
  let sess = ctx.session;
  let result = sess.user || {
    anonymous : true,
    hashCode : uuid.v4()
  };
  // 用户跟踪cookie
  let track = ctx.cookies.get(config.trackKey);
  if (!track) {
    ctx.cookies.set(config.trackKey, uuid.v4(), {
      signed : false,
      maxAge : 365 * 24 * 3600 * 1000
    });
  }

  sess.user = result;
  yield Promise.resolve();
  ctx.body = pick(result);
}

/**
 * [create 创建用户]
 * @return {[type]} [description]
 */
function *create() {
  /*jshint validthis:true */
  let ctx = this;
  let options = ctx.zipkinTrace;
  let done = zipkin.childTrace('user.create', options).done;
  let result = yield user.create(ctx.request.body);
  done();
  delete result.password;
  result.anonymous = false;
  ctx.session.user = result;
  ctx.body = pick(result);
}


/**
 * [login 登录]
 * @return {[type]} [description]
 */
function *login() {
  /*jshint validthis:true */
  let ctx = this;
  let hashCode = ctx.session.user.hashCode;
  let query = ctx.query;
  let account = ctx.query.account;
  let encryptPwd = ctx.query.password;
  let options = ctx.zipkinTrace;
  let done = zipkin.childTrace('user.login', options).done;
  let result = yield user.get(account, encryptPwd, hashCode);
  done();
  delete result.password;
  result.anonymous = false;
  ctx.session.user = result;
  ctx.body = pick(result);
}


/**
 * [logout 退出登录]
 * @return {[type]} [description]
 */
function *logout() {
  /*jshint validthis:true */
  let ctx = this;
  yield Promise.resolve();
  ctx.session = null;
  ctx.body = {
    anonymous : true,
    hashCode : uuid.v4()
  };
}


/**
 * [encrypt 加密密码]
 * @return {[type]} [description]
 */
function *encrypt() {
  /*jshint validthis:true */
  let ctx = this;
  yield Promise.resolve();
  let password = ctx.params.password;
  let hashCode = _.get(ctx, 'session.user.hashCode');
  if (!hashCode) {
    throw new Error('hashCode is undefined');
  }
  let shasum = crypto.createHash('sha1');
  let pwd = shasum.update(password).digest('hex');
  shasum = crypto.createHash('sha1');
  ctx.body = shasum.update(pwd + hashCode).digest('hex');
}
