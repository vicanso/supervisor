'use strict';
module.exports = [
  {
    route : '/sys/version',
    handler : 'system.version'
  },
  {
    route : '/sys/stats',
    handler : 'system.stats'
  },
  {
    route : '/sys/restart',
    method : 'post',
    middleware : 'authority.admin',
    handler : 'system.restart'
  },
  {
    route : '/sys/statistics',
    method : 'post',
    handler : 'system.statistics'
  },
  {
    route : '/sys/http-log',
    method : 'post',
    handler : 'system.httpLog'
  }
];
