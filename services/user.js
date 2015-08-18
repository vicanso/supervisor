'use strict';
const mongodb = localRequire('helpers/mongodb');
const moment = require('moment');
const errors = localRequire('errors');
const debug = localRequire('helpers/debug');
const _ = require('lodash');
const crypto = require('crypto');
const Joi = require('joi');
const util = require('util');
exports.create = create;
exports.get = get;
/**
 * [create 创建用户]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function *create(data) {
  let schema = {
    account : Joi.string(),
    password : Joi.string(),
    name : Joi.string()
  };
  data = Joi.validateThrow(data, schema, {
    stripUnknown : true
  });
  debug('create user:%j', data);
  let User = mongodb.model('User');
  let account = data.account;
  let result;
  try {
    result = yield new User(data).save();
  } catch (e) {
    if (e.code === 11000) {
      let str = util.format('duplicate key, create user fail, account:%s, name:%s', data.account, data.name);
      throw errors.get(str);
    } else {
      throw e;
    }
  }
  return result.toObject();
}


/**
 * [get description]
 * @param  {[type]} account    [description]
 * @param  {[type]} encryptPwd [description]
 * @param  {[type]} hashCode   [description]
 * @return {[type]}            [description]
 */
function *get(account, encryptPwd, hashCode) {
  if (!account || !encryptPwd || !hashCode) {
    throw errors.get('account encryptPwd hashCode cat not be null');
  }
  debug('get user:%s password:%s', account, encryptPwd);
  let User = mongodb.model('User');
  let doc = yield User.findOne({account : account});
  if (!doc) {
    throw errors.get('account is not exist');
  }
  doc = doc.toObject();
  debug('get user:%j', doc);
  let shasum = crypto.createHash('sha1');
  if (shasum.update(doc.password + hashCode).digest('hex') !== encryptPwd) {
    throw errors.get('login fail, user or password is wrong');
  }
  return doc;
}
