'use strict';
const mongodb = require('../helpers/mongodb');
const moment = require('moment');
const errors = require('../errors');
const debug = require('../helpers/debug');
const _ = require('lodash');
const crypto = require('crypto');
exports.create = create;
exports.get = get;
/**
 * [create 创建用户]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function *create(data) {
  let keys = ['account', 'password', 'name'];
  if (!data || !data.account || !data.password || !data.name) {
    throw errors.get(11, {
      params : keys
    });
  }
  data = _.pick(data, keys);
  debug('create user:%j', data);
  let User = mongodb.model('User');
  let account = data.account;
  let result;
  try {
    result = yield new User(data).save();
  } catch (e) {
    if (e.code === 11000) {
      console.info('duplicate key, create user fail, account:%s, name:%s', data.account, data.name);
      throw errors.get(201);
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
    throw errors.get(11, {
      params : ['account', 'password', 'hashCode']
    });
  }
  debug('get user:%s password:%s', account, encryptPwd);
  let User = mongodb.model('User');
  let doc = yield User.findOne({account : account});
  if (!doc) {
    throw errors.get(204);
  }
  doc = doc.toObject();
  debug('get user:%j', doc);
  let shasum = crypto.createHash('sha1');
  if (shasum.update(doc.password + hashCode).digest('hex') !== encryptPwd) {
    throw errors.get(204);
  }
  return doc;
}
