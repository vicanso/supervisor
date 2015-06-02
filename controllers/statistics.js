'use strict';
var debug = require('../helpers/debug');
module.exports = function *(){
  var data = this.request.body;;
  console.info(JSON.stringify(data));
  var timing = data.timing;
  if(timing){
    let result = {
      loadEvent : timing.loadEventEnd - timing.loadEventStart,
      domContentLoadedEvent : timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
      response : timing.responseEnd - timing.responseStart,
      firstByte : timing.responseStart - timing.requestStart,
      connect : timing.connectEnd - timing.connectStart,
      domainLookup : timing.domainLookupEnd - timing.domainLookupStart,
      fetch : timing.responseEnd - timing.fetchStart,
      request : timing.responseEnd - timing.requestStart,
      dom : timing.domComplete - timing.domLoading
    };
    console.info(result);
  }

  this.body = {
    msg : 'success'
  };
};