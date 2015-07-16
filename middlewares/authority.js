'use strict';
const crypto = require('crypto');
const globals = require('../globals');

exports.admin = admin;

/**
 * [admin admin的判断]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function *admin(next) {
  /*jshint validthis:true */
  let ctx = this;
  let data = ctx.request.body;
  let shasum = crypto.createHash('sha1');
  let key = shasum.update(data['jt-key']).digest('hex');
  let token = globals.get('config.token') || Date.now();
  if (key !== token) {
    ctx.throw(403);
  } else {
    yield* next;
  }
}
