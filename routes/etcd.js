'use strict';
module.exports = [
  {
    route : '/etcd',
    template : 'etcd',
    handler : 'etcd.view'
  },
  {
    route : '/etcd/list',
    handler : 'etcd.list'
  },
  {
    route : '/etcd/del',
    method : 'delete',
    handler : 'etcd.del'
  },
  {
    route : '/etcd/add',
    method : 'post',
    handler : 'etcd.add'
  }
];
