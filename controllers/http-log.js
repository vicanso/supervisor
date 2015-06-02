'use strict';
var _ = require('lodash');
var debug = require('../helpers/debug');
module.exports = function *(){
  var ua = this.header['user-agent'];
  var data = this.request.body;
  var ip = this.ips[0] || this.ip;
  var responseData = {
    msg : 'success'
  };
  if(!data){
    this.data = responseData;
    return;
  }
  var httpLog = 'ip:' + ip + ', ua:' + ua;
  _.forEach(data.success, function(tmp){
    console.log('%s, url:%s, method:%s, use:%d', httpLog, tmp.url, tmp.method, tmp.use);
  });
  _.forEach(data.error, function(tmp){
    console.error('%s, url:%s, method:%s, status:%d, use:%d', httpLog, tmp.url, tmp.method, tmp.status, tmp.use);
  });
  this.body = responseData;
};