'use strict';
var debug = require('../helpers/debug');
module.exports = function *(){
  this.set('Cache-Control', 'public, max-age=600');
  this.state.viewData = {
    page : 'home'
  };
};