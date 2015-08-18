'use strict';
const _ = require('lodash');
const config = localRequire('config');
const debug = localRequire('helpers/debug');
const FileImporter = require('jtfileimporter');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const componentsFile = path.join(__dirname, '../components.json');
exports.render = render;
exports.importer = importer;

/**
 * [render description]
 * @param  {[type]} template [description]
 * @return {[type]}          [description]
 */
function render(template) {
  debug('render tempalte:%s', template);
  return function *(next) {
    yield* next;
    /*jshint validthis:true */
    let ctx = this;
    let noCache = false;
    if (config.env === 'development') {
      noCache = true;
    }
    let importer = ctx.state.importer;
    ctx.state.TEMPLATE = template;
    ctx.render(template, ctx.state, noCache);
    logComponents(template, importer);
    ctx.body = appendJsAndCss(ctx.body, importer);
  };
}

/**
 * [importer description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function importer(options) {
  debug('importer options:%j', options);
  return function *(next){
    /*jshint validthis:true */
    let ctx = this;
    let importer = new FileImporter();
    let state = ctx.state;

    _.forEach(options, function(v, k){
      if (!state.DEBUG || k !== 'merge') {
        importer[k] = v;
      }
    });
    if (state.DEBUG) {
      importer.versionMode = 0;
    }
    state.importer = importer;
    yield* next;
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

  let components = {};
  if(fs.existsSync(componentsFile)){
    components = JSON.parse(fs.readFileSync(componentsFile, 'utf8') || '{}');
  }
  let data = components[template] || {};
  function isRejected(fileUrl) {
    return fileUrl.substring(0, 7) === 'http://' || fileUrl.substring(0, 8) === 'https://' || fileUrl.substring(0, 2) === '//';
  }
  function isDifference(arr1, arr2) {
    let str1 = '';
    let str2 = '';
    if (arr1) {
      str1 = arr1.join('');
    }
    if (arr2) {
      str2 = arr2.join('');
    }
    return str1 !== str2;
  }

  let jsFiles = _.filter(importer.getFiles('js'), function(file){
    return !isRejected(file);
  });
  let cssFiles = _.filter(importer.getFiles('css'), function(file){
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
