'use strict';
var requireTree = require('require-tree');
var controllers = requireTree('../controllers');
var router = require('../helpers/router');
var config = require('../config');
var _ = require('lodash');

var addImporter = getImporterMiddleware();

var nocacheQuery = require('../middlewares/query-checker')('cache=false')

var middlewares = {
  nocacheQuery : nocacheQuery,
  addImporter : addImporter
};

var routesInfos = requireTree('./');


exports.routerInfos = getRouterInfos(routesInfos);

exports.router = router.getRouteHandlers(convertRouterSetting(exports.routerInfos));



/**
 * [getRouterInfos 根据router的配置生成]
 * @param  {[type]} routesInfos [description]
 * @return {[type]}             [description]
 */
function getRouterInfos(routesInfos){
  var arr = [];
  _.forEach(routesInfos, function(routes){
    arr = arr.concat(routes);
  });
  return arr;
}

/**
 * [convertRouterSetting description]
 * @param  {[type]} routes [description]
 * @return {[type]}        [description]
 */
function convertRouterSetting(routes){
  var arr = [];
  _.forEach(routes, function(route){
    var result = _.pick(route, ['method', 'template', 'route']);
    result.handler = controllers[route.handler];
    if(_.isArray(route.middleware)){
      result.middleware = _.map(route.middleware, function(name){
        return middlewares[name]
      });
    }else if(route.middleware){
      result.middleware = [
        middlewares[route.middleware]
      ];
    }
    arr.push(result);
  });
  return arr;
}

/**
 * [getImporterMiddleware 获取file importer的middleware]
 * @return {[type]} [description]
 */
function getImporterMiddleware(){
  var importer = require('../middlewares/importer');
  var staticVerion = null;
  var staticMerge = null;
  var importerOptions = {
    prefix : config.staticUrlPrefix,
    versionMode : 1,
    srcPath : 'src'
  };
  try{
    staticVerion = require('../crc32');
    staticMerge = require('../merge');
  }catch(err){
    console.error(err);
  }
  if(config.env !== 'development'){
    importerOptions.version = staticVerion;
    importerOptions.merge = staticMerge;
  }
  return importer(importerOptions);
}


/**
 * [getRedisOptions 返回redis的配置]
 * @return {[type]} [description]
 */
function getRedisOptions(){
  var options = _.extend({}, config.servers.redis, config.redisOptions);
  if(process.env.REDIS_PWD){
    options.pass = process.env.REDIS_PWD;
  }
  options.cookie = {
    maxage : null
  };
  return options;
}