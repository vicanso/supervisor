'use strict';
const util = require('util');
module.exports = error;

/**
 * [error description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function *error(next) {
  try {
    yield next;
  } catch (err) {
    /*jshint validthis:true */
    let ctx = this;
    ctx.status = err.status || 500;
    ctx.set('Cache-Control', 'public, max-age=0');
    ctx.body = {
      code : err.code || 0,
      error : err.message
    };
    ctx.app.emit('error', err, this);
    let str = util.format('url:%s, code:%s, error:%s, stack:%s', ctx.originalUrl, err.code || '0', err.message, err.stack);
    if (!err.expose) {
      str = 'EXCEPTION ' + str;
    }
    console.error(str);
  }
}
