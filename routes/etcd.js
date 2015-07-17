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
    route : ['/etcd/list', '/etcd/list/:key'],
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
