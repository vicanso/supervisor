'use strict';
// 初始化相关信息，程序启动时调用
const config = require('./config');
const Joi = require('joi');

if (config.env !== 'development') {
  require('./helpers/logger');
}

/**
 * [validateThrow 如果校验失败，throw error，如果成功，返回转换后的数据]
 * @param  {[type]} argument [description]
 * @return {[type]}          [description]
 */
Joi.validateThrow = function () {
  let result = Joi.validate.apply(Joi, arguments);
  let err = result.error;
  if (err) {
    err.status = 400;
    throw err;
  } else {
    return result.value;
  }
};
