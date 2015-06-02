'use strict';
var _ = require('lodash');
var debug = require('../helpers/debug');
var config = require('../config');
var router = require('koa-router')();
var jade = require('koa-jade');
var fs = require('fs');
var path = require('path');
var moment = require('moment');
var componentsFile = path.join(__dirname, '../components.json');
var viewPath = config.viewPath;
exports.getRouteHandlers = getRouteHandlers;


/**
 * [getTemplateRender 获取模板的render]
 * @param  {[type]} template [description]
 * @return {[type]}          [description]
 */
function getTemplateRender(template){
  return function *(next){
    yield* next;
    var state = this.state;
    var importer = state.importer;
    var noCache = false;
    if(config.env === 'development'){
      noCache = true;
    }
    state.TEMPLATE = template;
    var start = Date.now();
    this.render(template, state, noCache);
    this.body = appendJsAndCss(this.body, importer);
    if(config.env === 'development'){
      logComponents(template, importer);
    }
    // render模板的时间
    this._renderTimeConsuming = Date.now() - start;
  };
}

/**
 * [appendJsAndCss 插入js和css]
 * @param  {[type]} html     [description]
 * @param  {[type]} importer [description]
 * @return {[type]}          [description]
 */
function appendJsAndCss(html, importer){
  html = html.replace('<!--CSS_FILES_CONTAINER-->', importer.exportCss());
  html = html.replace('<!--JS_FILES_CONTAINER-->', importer.exportJs());
  return html;
}


/**
 * [logComponents 记录该template使用到的静态文件]
 * @param  {[type]} template [description]
 * @param  {[type]} importer [description]
 * @return {[type]}          [description]
 */
function logComponents(template, importer){

  var components = {};
  if(fs.existsSync(componentsFile)){
    components = JSON.parse(fs.readFileSync(componentsFile, 'utf8') || '{}');
  }
  var data = components[template] || {};
  var isRejected = function(fileUrl){
    return fileUrl.substring(0, 7) === 'http://' || fileUrl.substring(0, 8) === 'https://' || fileUrl.substring(0, 2) === '//';
  };
  var isDifference = function(arr1, arr2){
    var str1 = '';
    var str2 = '';
    if(arr1){
      str1 = arr1.join('');
    }
    if(arr2){
      str2 = arr2.join('');
    }
    return str1 !== str2;
  };

  var jsFiles = _.filter(importer.getFiles('js'), function(file){
    return !isRejected(file);
  });
  var cssFiles = _.filter(importer.getFiles('css'), function(file){
    return !isRejected(file);
  });
  if(isDifference(data.js, jsFiles) || isDifference(data.css, cssFiles)){
    data.css = cssFiles;
    data.js = jsFiles;
    data.modifiedAt = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
    components[template] = data;
    fs.writeFileSync(componentsFile, JSON.stringify(components, null, 2));
  }
}


/**
 * [getRouteHandlers 获取路由处理函数列表]
 * @param  {[type]} routeInfos [description]
 * @return {[type]}            [description]
 */
function getRouteHandlers(routeInfos){
  debug('routeInfos:%j', routeInfos);
  _.forEach(routeInfos, function(routeInfo){
    var template = routeInfo.template;
    var middleware = routeInfo.middleware || [];
    var routes = routeInfo.route;
    if(!routes){
      console.error('route is undefined, ' + JSON.stringify(routeInfo));
      return;
    }
    if(!_.isArray(routes)){
      routes = [routes];
    }
    var methods = routeInfo.method || 'get';
    if(!_.isArray(methods)){
      methods = [methods];
    }
    var handler = routeInfo.handler;
    if(!handler){
      console.error('handler is undefined, ' + JSON.stringify(routeInfo));
      return;
    }
    if(template){
      middleware.push(jade.middleware({
        viewPath : viewPath
      }));
      middleware.push(getTemplateRender(template));
    }
    _.forEach(routes, function(route){
      _.forEach(methods, function(method){
        method = method.toLowerCase();
        var params = [route].concat(middleware);
        params.push(handler);
        router[method].apply(router, params);
      });
    });
  });
  return router.routes();
}