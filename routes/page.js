'use strict';
module.exports = [
  {
    route : ['/', '/home'],
    template : 'home',
    handler : 'page.home'
  },
  {
    route : '/varnish',
    template : 'varnish',
    handler : 'page.varnish'
  },
  {
    route : '/backend',
    template : 'backend',
    handler : 'page.backend'
  },
  {
    route : '/backend/add',
    method : 'post',
    handler : 'page.backendAdd'
  }
];
