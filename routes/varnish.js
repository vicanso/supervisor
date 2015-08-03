'use strict';
module.exports = [
  {
    route : '/varnish',
    template : 'varnish',
    handler : 'varnish.view'
  },
  {
    route : '/varnish/list',
    handler : 'varnish.list'
  },
  {
    route : '/varnish/stats/:ip/:port',
    handler : 'varnish.stats'
  }
];
