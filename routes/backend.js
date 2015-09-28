'use strict';
module.exports = [{
  route: '/backend/deregister/:id',
  method: 'post',
  handler: 'backend.deregister'
}, {
  route: ['/backend', '/backend/:type'],
  template: 'backend',
  handler: 'backend.view'
}];
