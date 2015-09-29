'use strict';
module.exports = [{
  route: '/backend/deregister/:id',
  method: 'post',
  handler: 'backend.deregister'
}, {
  route: '/backend',
  template: 'backend',
  handler: 'backend.view'
}, {
  route: '/backends/:type',
  handler: 'backend.list'
}];
