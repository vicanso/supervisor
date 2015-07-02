'use strict';
module.exports = [
  {
    route : '/etcd',
    template : 'etcd',
    handler : 'etcd.view'
  },
  {
    route : '/etcd/get',
    handler : 'etcd.get'
  },
  {
    route : '/etcd/del',
    method : 'delete',
    handler : 'etcd.del'
  }
];