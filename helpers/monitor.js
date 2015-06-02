'use strict';
var v8 = require('v8');
var bytes = require('bytes');
var _ = require('lodash');
var toobusy = require('toobusy-js');
var config = require('../config');
var processName = config.processName;
exports.run = _.once(run);


/**
 * [run description]
 * @return {[type]} [description]
 */
function run(){
  heap();
  lag();
}

/**
 * [heap 输出heap的使用]
 * @return {[type]} [description]
 */
function heap(){
  var data = v8.getHeapStatistics();
  var totalHeapSize = bytes(data.total_heap_size);
  var totalHeapSizeExec = bytes(data.total_heap_size_executable);
  var physicalTotal = bytes(data.total_physical_size);
  var usedHeapSize = bytes(data.used_heap_size);
  console.info('process:%s memory exec:%s use:%s total:%s physical:%s', processName, totalHeapSizeExec, usedHeapSize, totalHeapSize, physicalTotal);
  var timer = setTimeout(heap, 10000);
  timer.unref();
}

var lagTotal = 0;
var lagCount = 0;
/**
 * [lag 输出lag]
 * @return {[type]} [description]
 */
function lag(){
  lagTotal += toobusy.lag();
  lagCount++;
  if(lagCount === 10){
    var v = Math.ceil(lagTotal / lagCount);
    lagCount = 0;
    lagTotal = 0;
    console.info('process:%s lag:%d', processName, v);
    // TODO
    // stats
  }
  var timer = setTimeout(lag, 1000);
  timer.unref();
}