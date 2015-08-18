'use strict';
const _ = require('lodash');
const requireTree = require('require-tree');
const debug = localRequire('helpers/debug');
const errors = localRequire('errors');
const sdc = localRequire('helpers/sdc');
var client = null;

exports.init = _.once(init);
exports.model = model;

/**
 * [init 初始化数据库]
 * @param  {[type]} uri       [description]
 * @param  {[type]} options   [description]
 * @param  {[type]} modelPath [description]
 * @return {[type]}           [description]
 */
function init(uri, options, modelPath) {
  if (_.isString(options)) {
    modelPath = options;
    options = null;
  }
  if (!modelPath) {
    throw new Error('modelPath can not be null');
  }
  const mongoose = require('mongoose');
  const Schema = mongoose.Schema;
  options = _.extend({
    db : {
      native_parser : true
    },
    server : {
      poolSize : 5
    }
  }, options);
  client = mongoose.createConnection(uri, options);
  client.on('connected', function() {
    console.info(uri + ' connected');
  });
  client.on('disconnected', function() {
    console.info(uri + ' disconnected');
  });
  client.on('error', function(err) {
    console.error(err);
  });
  initModels(modelPath);
}


/**
 * [initModels description]
 * @param  {[type]} modelPath [description]
 * @return {[type]}           [description]
 */
function initModels(modelPath) {
  const mongoose = require('mongoose');
  const Schema = mongoose.Schema;
  let models = requireTree(modelPath);
  _.forEach(models, function(model, name){
    name = name.charAt(0).toUpperCase() + name.substring(1);
    if (model.name) {
      name = model.name;
    }
    let schema = new Schema(model.schema, model.options);
    addStats(schema, name);
    if (model.indexes) {
      _.forEach(model.indexes, function(indexOptions) {
        schema.index(indexOptions);
      });
    }
    let hook = function (type) {
      _.forEach(model[type], function (fn, key) {
        if (!_.isArray(fn)) {
          fn = [fn];
        }
        _.forEach(fn, function (fn) {
          schema[type](key, fn);
        });
      });
    };
    hook('pre');
    hook('post');

    client.model(name, schema);
  });
}



/**
 * [addStats 添加mongoose相关操作的性能统计]
 * @param {[type]} schema [description]
 * @param {[type]} name   [description]
 */
function addStats(schema, name) {
  let opList = [
    'remove',
    'find',
    'findById',
    'findOne',
    'count',
    'distinct',
    'where',
    'findOneAndUpdate',
    'findByIdAndUpdate',
    'findOneAndRemove',
    'findByIdAndRemove',
    'update',
    'mapReduce',
    'save'
  ];
  _.forEach(opList, function(op){
    initStatsDict(name, op);
    schema.pre(op, function(next){
      debug('mongoose collection:%s pre %s', name, op);
      sdc.increment('mongodb.processing.' + name + '.' + op);
      this._start = Date.now();
      stats(name, op, 'pre');
      next();
    });
    schema.post(op, function(){
      let use = Date.now() - this._start;
      delete this._start;
      sdc.decrement('mongodb.processing.' + name + '.' + op);
      sdc.increment('mongodb.' + name + '.' + op);
      sdc.timing('mongodb.use.' + name + '.' + op, use);
      console.info('mongoose collection:%s %s use:%d', name, op, use);
      stats(name, op, 'post');
    });
  });
}


/**
 * [initStatsDict 初始化stats]
 * @param  {[type]} name [description]
 * @param  {[type]} op   [description]
 * @return {[type]}      [description]
 */
let statsDict = {
  all : {
    total : 0,
    doing : 0
  }
};
function initStatsDict(name, op) {
  if (!statsDict[name]) {
    statsDict[name] = {};
  }
  statsDict[name][op] = {
    total : 0,
    doing : 0
  };
}



/**
 * [stats description]
 * @param  {[type]} name [description]
 * @param  {[type]} op   [description]
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
function stats(name, op, type){
  let tmp = statsDict[name][op];
  let all = statsDict.all;
  switch(type){
    case 'pre':
      tmp.doing++;
      tmp.total++;
      all.doing++;
      all.total++;
    break;
    default:
      tmp.doing--;
      all.doing--;
    break;
  }
  if (all.total % 10 === 0) {
    console.info('mongoose stats:%j', statsDict);
  }
}


/**
 * [model 返回mongoose model]
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
function model(name) {
  if(!client){
    throw errors.get('the db is not init!');
  }
  return client.model(name);
}
