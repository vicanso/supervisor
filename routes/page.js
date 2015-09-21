'use strict';
module.exports = [{
  route: ['/', '/home'],
  template: 'home',
  handler: 'home'
}, {
  route: '/backend',
  template: 'backend',
  handler: 'backend'
}, {
  route: '/varnish',
  template: 'varnish',
  handler: 'varnish.view'
}, {
  route: '/varnish/stats/:ip/:port',
  handler: 'varnish.stats'
}, {
  route: '/log',
  template: 'log',
  handler: 'log.view'
}];
