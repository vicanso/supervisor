'use strict';
var pm2 = require('pm2');
var co = require('co');
var moment = require('moment');
var _ = require('lodash');
var config = require('../config');


exports.list = list;

exports.restartAll = restartAll;

/**
 * [getProcessInfos 获取进程信息]
 * @param  {[type]} processList [description]
 * @return {[type]}             [description]
 */
function getProcessInfos(processList){
  var app = config.app;
  var result = [];

  var format = function(ms){
    var seconds = Math.floor(ms / 1000);
    var str = '';
    var hour = 3600;
    var day = 24 * 3600;
    var minute = 60;
    if(seconds > day){
      str += (Math.floor(seconds / day) + 'd');
      seconds %= day;
    }

    if(seconds > hour){
      str += (Math.floor(seconds / hour) + 'h');
      seconds %= hour;
    }

    if(seconds > minute){
      str += (Math.floor(seconds / minute) + 'm');
      seconds %= minute;
    }

    str += (seconds + 's');

    return str;
  };
  _.forEach(processList, function(info){
    if(info.name !== app){
      return;
    }
    var pm2Env = info.pm2_env;
    result.push({
      pid : info.pid,
      id : pm2Env.pm_id,
      unstableRestarts : pm2Env.unstable_restarts,
      uptime : format(Date.now() - pm2Env.pm_uptime),
      restartTime : pm2Env.restart_time,
      createdAt : moment(pm2Env.created_at).format(),
      pmUptime : moment(pm2Env.pm_uptime).format(),
      status : pm2Env.status,
      monit : info.monit,
      appVersion : pm2Env.env.appVersion
    });
  });
  return result;
}

/**
 * [list 列出所有的pm2进程]
 * @return {[type]} [description]
 */
function *list(){
  yield pm2.connect;
  var processList = yield pm2.list;
  var processInfos = getProcessInfos(processList);
  console.dir(processInfos)
  return processInfos;
}

/**
 * [restartAll 重启仅当前应用所有的pm2进程]
 * @return {[type]} [description]
 */
function *restartAll(){
  // TODO
  // 如何重启所有相关的pm2的进程
}
