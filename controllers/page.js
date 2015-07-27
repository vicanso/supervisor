'use strict';
const globals = require('../globals');
const _  = require('lodash');

exports.home = home;
exports.varnish = varnish;
exports.backend = backend;
exports.backendAdd = backendAdd;


/**
 * [home description]
 * @return {[type]} [description]
 */
function *home(){
  /*jshint validthis:true */
  let ctx = this;
  yield Promise.resolve();
  ctx.set({
    'Cache-Control' : 'public, max-age=60'
  });
  ctx.state.viewData = {
    name : 'vicanso',
    page : 'home'
  };
}



/**
 * [varnish description]
 * @return {[type]} [description]
 */
function *varnish(){
  /*jshint validthis:true */
  let ctx = this;
  yield Promise.resolve();
  ctx.set({
    'Cache-Control' : 'public, max-age=60'
  });
  ctx.state.viewData = {
    page : 'varnish'
  };
}


/**
 * [backend description]
 * @return {[type]} [description]
 */
function *backend(){
  /*jshint validthis:true */
  let ctx = this;
  yield Promise.resolve();
  ctx.set({
    'Cache-Control' : 'public, max-age=10'
  });
  ctx.state.viewData = {
    page : 'backend',
    backends : globals.get('backends') || []
  };
}


/**
 * [backendAdd description]
 * @return {[type]} [description]
 */
function *backendAdd() {
  /*jshint validthis:true */
  let ctx = this;
  let data = ctx.request.body;
  let backends = globals.get('backends') || [];
  backends = _.filter(backends, function (item) {
    if (item.name !== data.name) {
      return true;
    } else {
      return false;
    }
  });
  backends.push({
    name : data.name,
    ip : ctx.ip || _.get('ctx', 'ips[0]')
  });
  globals.set('backends', backends);
  ctx.body = {
    msg : 'success'
  };
}
