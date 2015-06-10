'use strict';
module.exports = [
  {
    middleware : ['addImporter'],
    route : '/',
    template : 'home',
    handler : 'home'
  },
  {
    middleware : 'addImporter',
    route : '/varnish',
    template : 'varnish',
    handler : 'varnish.view'
  },
  {
    route : '/varnish/backends/:ip/:port',
    handler : 'varnish.backends'
  },
  {
    middleware : 'addImporter',
    route : '/backend',
    template : 'backend',
    handler : 'backend.view'
  },
  {
    method : 'post',
    route : '/backend',
    handler : 'backend.save'
  },
  {
    method : 'delete',
    route : '/backend/:key/:index',
    handler : 'backend.remove'
  }
];