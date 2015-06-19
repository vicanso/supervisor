var _ = require('lodash');
var jade = require('koa-jade');
var FileImporter = require('jtfileimporter');
var render = jade.renderer();
exports.responseError = responseError

function getImporter(){
  var importer = new FileImporter();
  var options = require('./util').importerOptions();
  _.forEach(options, function(v, k){
    importer[k] = v;
  });
  return importer;
}

function responseError(ctx, err){
  // var data = err.data || err.message;
  var res = ctx.res;
  var end = res.end;
  ctx.res.end = function(){
    var data = err.data;
    var xhr = !!ctx.get('x-requested-with');
    if(!data){
      data = {
        code : 0,
        msg : err.message
      };
    }
    var resData = '';
    if(xhr){
      resData = JSON.stringify(data);
      ctx.type = 'application/json; charset=utf-8';
    }else{
      var result = render('error', {
        importer : getImporter(),
        viewData : data
      });
      resData = result.body;
      ctx.type = 'text/html; charset=utf-8';
    }
    ctx.set('Cache-Control', 'must-revalidate, max-age=0');
    ctx.length = Buffer.byteLength(resData);
    end.call(res, resData);

  };
}