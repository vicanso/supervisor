'use strict';
const _ = require('lodash');

module.exports = picker;

/**
 * [picker 筛选数据中的字段]
 * @param  {[type]} field [description]
 * @return {[type]}       [description]
 */
function picker(field) {
  return function *picker(next) {
    yield *next;
    /*jshint validthis:true */
    let ctx = this;
    let v = ctx.query[field];
    delete ctx.query[field];
    if (!v) {
      return;
    }
    let pickerFn = 'pick';
    if (v.charAt(0) === '-') {
      pickerFn = 'omit';
      v = v.substring(1);
    }
    let arr = v.split(',');
    let data = ctx.body;
    let fn = function (item) {
      return _[pickerFn](item, arr);
    };
    if (_.isArray(data)) {
      data = _.map(data, fn);
    } else {
      data = fn(data);
    }
    ctx.body = data;
  };
}
