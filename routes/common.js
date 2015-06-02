'use strict';
module.exports = [
  {
    method : 'post',
    route : '/httplog',
    handler : 'http-log'
  },
  {
    method : 'post',
    route : '/statistics',
    handler : 'statistics'
  }
];