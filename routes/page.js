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
    template : 'varnish/index',
    handler : 'varnish.view'
  },
  {
    route : '/varnish/backends/:ip/:port',
    handler : 'varnish.backends'
  },
  {
    route : '/varnish/vcl/:ip/:port',
    handler : 'varnish.vcl'
  },
  {
    route : '/varnish/stats/:ip/:port',
    handler : 'varnish.stats'
  },
  {
    middleware : 'addImporter',
    template : 'varnish/monitor',
    route : '/varnish/monitor',
    handler : 'varnish.monitor'
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