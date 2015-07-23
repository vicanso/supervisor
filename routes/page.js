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
  }
];
