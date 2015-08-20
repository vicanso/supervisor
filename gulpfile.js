var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var stylus = require('gulp-stylus');
var base64 = require('gulp-base64');
var cssmin = require('gulp-cssmin');
var moment = require('moment');
var uglify = require('gulp-uglify');
var through = require('through');
var bufferCrc32 = require('buffer-crc32');
var copy = require('gulp-copy');
var path = require('path');
var fs = require('fs');
var del = require('del');
var nib = require('nib');
var _ = require('lodash');

function concatFiles(filePath, files) {
  var savePath = path.join(filePath, 'merge');
  if(!fs.existsSync(savePath)){
    fs.mkdirSync(savePath);
  }
  var names = [];
  var data = [];
  var ext = path.extname(files[0]);
  _.forEach(files, function(file){
    var desc = '/*' + file + '*/';
    file = path.join(filePath, file);
    var buf = fs.readFileSync(file, 'utf8');
    names.push(path.basename(file, ext));
    data.push(desc + '\n' + buf);
  });
  var name = names.join(',') + ext;
  fs.writeFileSync(path.join(savePath, name), data.join('\n'));
}

gulp.task('jshint', function() {
  return gulp.src(['*.js', '**/*.js', '!node_modules/*.js', '!node_modules/**/*.js', '!statics/src/component/*.js', '!statics/dest/**/*.js', '!statics/build/**/*.js'])
    .pipe(jshint({
      predef : ['require', 'module', 'localRequire'],
      node : true,
      esnext : true
    }))
    .pipe(jshint.reporter('default'));
});


gulp.task('version', function(cbf) {
  var version = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
  var file = './package.json';
  var json = JSON.parse(fs.readFileSync(file));
  json.appVersion = version;
  fs.writeFileSync(file, JSON.stringify(json, null, 2));
  cbf();
});

gulp.task('clean:dest', function(cbf){
  del(['statics/dest'], cbf);
});

gulp.task('clean:build', ['static-version'], function(cbf){
  del(['statics/build'], cbf);
});


gulp.task('static-stylus', ['clean:dest', 'static-css'], function(){
  return gulp.src('statics/src/**/*.styl')
    .pipe(stylus({
      use : nib()
    }))
    .pipe(base64())
    .pipe(cssmin())
    .pipe(gulp.dest('statics/build'));
});

gulp.task('static-css', ['clean:dest'], function(){
  return gulp.src(['statics/src/**/*.css'])
    .pipe(base64())
    .pipe(cssmin())
    .pipe(gulp.dest('statics/build'));
});


gulp.task('static-js', ['clean:dest'], function(){
  return gulp.src('statics/src/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('statics/build'));
});

gulp.task('static-copy-other', ['clean:dest', 'static-stylus'], function(){
  return gulp.src(['statics/**/*', '!statics/**/*.styl'])
    .pipe(copy('statics/dest', {
      prefix : 2
    }));
});

gulp.task('static-merge', ['static-css', 'static-js', 'static-stylus'], function(cbf){
  var merge = require('./merge');
  var components = require('./components');
  var buildPath = 'statics/build';
  _.forEach(merge.files, function(files){
    concatFiles(buildPath, files);
  });

  var filterFiles = [];
  if(merge.except){
    filterFiles.push.apply(filterFiles, merge.except);
  }
  if(merge.files){
    filterFiles.push.apply(filterFiles, merge.files);
  }
  filterFiles = _.flatten(filterFiles);
  var getRestFiles = function(files){
    return _.filter(files, function(file){
      return !~_.indexOf(filterFiles, file);
    });
  };
  _.forEach(components, function(component){
    var cssFiles = getRestFiles(component.css);
    if(cssFiles.length > 1){
      concatFiles(buildPath, cssFiles);
    }
    var jsFiles = getRestFiles(component.js);
    if(jsFiles.length > 1){
      concatFiles(buildPath, jsFiles);
    }
  });
  cbf();
});


gulp.task('static-version', ['static-merge', 'static-copy-other'], function(){
  var crc32Infos = {};
  var crc32 = function(file){
    var version = bufferCrc32.unsigned(file.contents);
    crc32Infos['/' + file.relative] = version;
    var ext = path.extname(file.path);
    file.path = file.path.substring(0, file.path.length - ext.length) + '.' + version + ext;
    this.emit('data', file);
  };

  return gulp.src(['statics/build/**/*.js', 'statics/build/**/*.css', 'statics/dest/**/*.png', 'statics/dest/**/*.jpg', 'statics/dest/**/*.gif'])
    .pipe(through(crc32, function(){
      var keys = _.keys(crc32Infos).sort();
      var result = {};
      _.forEach(keys, function (key) {
        result[key] = crc32Infos[key];
      });
      fs.writeFileSync('crc32.json', JSON.stringify(result, null, 2));
      this.emit('end');
    }))
    .pipe(gulp.dest('statics/dest'));
});


gulp.task('file-limit', ['static-version'], function () {
  var limitSize = 2 * 1024;
  var limit = function (file) {
    file.contents = null;
    if (file.stat.size > limitSize) {
      var size = Math.ceil(file.stat.size / 1024);
      console.error('Warning, the size of ' + file.history[0] + ' is ' + size + 'KB');
    }
  };
  return gulp.src(['statics/dest/**/*.png', 'statics/dest/**/*.jpg', 'statics/dest/**/*.gif']).pipe(through(limit, function () {
    this.emit('end');
  }));
});

gulp.task('default', ['clean:dest', 'clean:build', 'jshint', 'static-copy-other', 'static-merge', 'static-version', 'clean:build', 'version', 'file-limit']);
