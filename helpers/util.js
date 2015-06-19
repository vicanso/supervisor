var config = require('../config');

exports.importerOptions = getImporterOptions;

function getImporterOptions(){
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
  return importerOptions;
}