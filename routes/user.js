'use strict';
const _ = require('lodash');
let routes = [
  {
    route : '/1/users/me',
    middleware : 'no-cache',
    handler : 'user.get'
  },
  {
    route : '/1/users',
    method : 'post',
    handler : 'user.create'
  },
  {
    route : '/1/login',
    middleware : 'no-cache',
    handler : 'user.login'
  },
  {
    route : '/1/logout',
    method : 'post',
    handler : 'user.logout'
  },
  {
    // 测试环境使用，将密码加密
    route : '/1/encrypt/:password',
    handler : 'user.encrypt'
  }
];

_.forEach(routes, function (item) {
  if (!item.middleware) {
    item.middleware = [];
  } else if (!_.isArray(item.middleware)) {
    item.middleware = [item.middleware];
  }
  let arr = ['session.get'];
  _.forEach(arr, function (tmp) {
    if (_.indexOf(item.middleware, tmp) === -1) {
      item.middleware.push(tmp);
    }
  });
});

module.exports = routes;
