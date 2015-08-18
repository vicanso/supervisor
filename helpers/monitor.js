'use strict';
const v8 = require('v8');
const bytes = require('bytes');
const toobusy = require('toobusy-js');
const _ = require('lodash');
const config = localRequire('config');
const sdc = localRequire('helpers/sdc');

exports.run = _.once(run);

/**
 * [run description]
 * @param  {[type]} interval [description]
 * @return {[type]}          [description]
 */
function run(interval) {
  let data = v8.getHeapStatistics();
  let totalHeapSize = bytes(data.total_heap_size);
  let totalHeapSizeExec = bytes(data.total_heap_size_executable);
  let physicalTotal = bytes(data.total_physical_size);
  let usedHeapSize = bytes(data.used_heap_size);
  let lag = toobusy.lag();
  if (config.env === 'development' || data.total_physical_size > 150 * 1024 * 1024 || lag > 70) {
    console.info('MONITOR %s memory exec:%s use:%s total:%s physical:%s lag:%d', config.processName, totalHeapSizeExec, usedHeapSize, totalHeapSize, physicalTotal, lag);
  }
  sdc.set('lag', lag);
  sdc.set('memory.exec', parseInt(totalHeapSizeExec));
  sdc.set('memory.physical', parseInt(physicalTotal));
  let timer = setTimeout(function() {
    run(interval);
  }, interval);
  timer.unref();
}
