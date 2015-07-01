'use strict';
module.exports = [
  {
    route : ['/', '/home'],
    template : 'home',
    handler : 'home'
  },
  {
    route : '/etcd',
    template : 'etcd',
    handler : 'etcd.view'
  }
];
