'use strict';
const errors = require('../errors');
module.exports = user;
/**
 * [user description]
 * @return {[type]} [description]
 */
function *user(){
  /*jshint validthis:true */
  let ctx = this;
  yield function(done) {
    setImmediate(done);
  };
  
  ctx.body = {
    name : 'vicanso'
  };
}
