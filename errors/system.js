'use strict';
// 用于定义系统相关的出错信息，使用code 1 - 100
module.exports = {
  '1' : {
    cn : '服务器繁忙，请稍候再试。',
    en : 'The server is busy, please try again later.'
  },
  '10' : {
    cn : '数据库未初始化',
    en : 'the db is not initialized!'
  },
  '11' : {
    cn : '参数<%= params %>不能为空',
    en : '<%= params %> can not be null'
  }
};
