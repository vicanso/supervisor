'use strict';
const requireTree = require('require-tree');
const _ = require('lodash');
const debug = require('../helpers/debug');
const koaRouter = require('koa-router');
const jade = require('koa-jade');
const config = require('../config');
const globals = require('../globals');

module.exports = getRoutes;

/**
 * [getRoutes 获取路由处理列表]
 * @return {[type]} [description]
 */
function getRoutes() {
  let routerConfigs = getRouterConfigs();
  let router = koaRouter();
  let routeList = [];
  _.forEach(routerConfigs, function(routerConfig) {
    let middlewareArr = routerConfig.middleware || [];
    let routes = routerConfig.route;
    if (!routes) {
      console.error('route is undefined, ' + JSON.stringify(routerConfig));
      return;
    }
    if (!_.isArray(routes)) {
      routes = [routes];
    }
    _.forEach(routes, function (tmp) {
      if (_.indexOf(routeList, tmp) !== -1) {
        console.error('route:%s is repetitionary', tmp);
      } else {
        routeList.push(tmp);
      }
    });
    let methods = routerConfig.method || 'get';
    if (!_.isArray(methods)) {
      methods = [methods];
    }
    let handler = routerConfig.handler;
    if (!handler) {
      console.error('handler is undefined, ' + JSON.stringify(routerConfig));
      return;
    }
    _.forEach(routes, function(route) {
      _.forEach(methods, function(method) {
        method = method.toLowerCase();
        let params = [route].concat(middlewareArr);
        params.push(handler);
        router[method].apply(router, params);
      });
    });
  });
  return router.routes();
}

/**
 * [getRouterConfigs 读取当前目录下的所有路由处理配置，生成处理列表]
 * @return {[type]} [description]
 */
function getRouterConfigs() {
  let routesInfos = requireTree('./');
  let controllers = requireTree('../controllers');
  let middlewares = requireTree('../middlewares');
  let routes = _.flatten(_.values(routesInfos));
  debug('routes:%j', routes);
  let arr = [];
  let jadeRender = jade.middleware({
    viewPath : config.viewPath
  });
  let importerOptions = {
    prefix : config.staticUrlPrefix
  };
  if (config.env !== 'development') {
    importerOptions.merge = require('../merge');
    importerOptions.version = require('../crc32');
    importerOptions.versionMode = 1;
  }
  let importer = middlewares.view.importer(importerOptions);
  _.forEach(routes, function(route) {
    let result = _.pick(route, ['method', 'route']);
    result.handler = _.get(controllers, route.handler);
    let middleware = route.middleware;
    if (middleware) {
      if (!_.isArray(middleware)) {
        middleware = [middleware];
      }
      result.middleware = _.map(middleware, function(name) {
        return _.get(middlewares, name);
      });
    }
    let template = route.template;
    if (template) {
      result.middleware = result.middleware || [];
      result.middleware.push(importer);
      result.middleware.push(jadeRender);
      result.middleware.push(middlewares.view.render(template));
    }
    arr.push(result);
  });
  return arr;
}
