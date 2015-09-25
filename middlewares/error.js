'use strict';
const util = require('util');
const config = localRequire('config');

module.exports = error;

/**
 * [error description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function* error(next) {
  try {
    yield next;
  } catch (err) {
    /*jshint validthis:true */
    let ctx = this;
    ctx.status = err.status || 500;
    ctx.set('Cache-Control', 'public, max-age=0');
    if (ctx.state.TEMPLATE) {
      let htmlArr = ['<html>'];
      if (config.env !== 'production') {
        htmlArr.push('<pre>' + err.stack +
          '</pre>');
      } else {
        htmlArr.push('<pre>' + err.message.replace(config.viewPath, '') +
          '</pre>');
      }
      htmlArr.push('</html>');
      ctx.body = htmlArr.join('');
    } else {
      let data = {
        code: err.code || 0,
        error: err.message
      };
      if (err.type) {
        data.type = err.type;
      }
      if (err.extra) {
        data.extra = err.extra;
      }
      if (config.env !== 'production') {
        data.stack = err.stack;
      }
      ctx.body = data;
    }

    ctx.app.emit('error', err, this);
    let str = util.format('url:%s, code:%s, error:%s, stack:%s', ctx.originalUrl,
      err.code || '0', err.message, err.stack);
    if (!err.expose) {
      str = 'EXCEPTION ' + str;
    }
    console.error(str);
  }
}
