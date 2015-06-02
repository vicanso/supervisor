'use strict';
var FileImporter = require('jtfileimporter');
var _ = require('lodash');
var debug = require('../helpers/debug');
module.exports = function(options){
  debug('importer options:%j', options);
  return function *(next){
    var importer = new FileImporter();
    var state = this.state;
    _.forEach(options, function(v, k){
      importer[k] = v;
    });
    importer.debug = !!state.DEBUG;
    state.importer = importer;
    yield* next;
  };
};