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
    handler : 'varnish'
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
  }
];