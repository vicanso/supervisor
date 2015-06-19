'use strict';
var debug = require('../helpers/debug');
var errors = require('../errors');
module.exports = function *(){
  yield function(done){
    setTimeout(done, 10000);
  };
  this.set('Cache-Control', 'public, max-age=600');
  this.state.viewData = {
    page : 'home'
  };
};