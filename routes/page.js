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
    middleware : 'addImporter',
    template : 'varnish/stats',
    route : '/varnish/stats',
    handler : 'varnish.statsView'
  },
  {
    route : '/varnish/stats/:ip/:port',
    handler : 'varnish.stats'
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
  },
  {
    middleware : 'addImporter',
    route : '/setting',
    template : 'setting',
    handler : 'setting.view'
  }
];