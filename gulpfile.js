// gulp task dependencies
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var path = require('path');

// 
// BASE PREFIX
//

var input = 'build/';
var output = 'dist/';

// 
// DIST PATHS
// 

var dist = {
  outfile: 'dist.min.js',
  files: [
    input + 'js/timeUtils.js',
    input + 'js/jDom.js',
    input + 'js/apptPicker.js'
  ]
};

//
// DIST TASK
//

gulp.task('scripts:dist', function() {
  return gulp.src(dist.files)
    .pipe(uglify())
    .pipe(concat(dist.outfile))
    .pipe(gulp.dest(output + 'js/'));
});

// 
// VENDOR PATHS
// 

var vendor = {
  outfile: 'vendor.min.js',
  files: [
    input + 'js/rainbow-custom.min.js',
    input + 'js/jquery.min.js',
    input + 'js/jquery.easing.min.js'
  ]
};

//
// VENDOR TASK
//

gulp.task('scripts:vendor', function() {
  return gulp.src(vendor.files)
    .pipe(uglify())
    .pipe(concat(vendor.outfile))
    .pipe(gulp.dest(output + 'js/'));
});

// 
// LESS PATHS
// 

var css = {
  files: [input + 'less/**/*.less'],
  prefix: input + 'less',
  outfile: 'style.min.css'
};

//
// STYLESHEET TASK
//

gulp.task('stylesheet:dist', function () {
  return gulp.src(css.prefix + '/style.less')
    .pipe(less())
    .pipe(minifyCSS())
    .pipe(concat(css.outfile))
    .pipe(gulp.dest(output + 'css/'));
});

// 
// LESS PATHS
// 

var demo = {
  files: [input + 'less/**/*.less'],
  prefix: input + 'less',
  outfile: 'demo.min.css'
};

//
// STYLESHEET TASK
//

gulp.task('stylesheet:demo', function () {
  return gulp.src(demo.prefix + '/demo.less')
    .pipe(less())
    .pipe(minifyCSS())
    .pipe(concat(demo.outfile))
    .pipe(gulp.dest(output + 'css/'));
});

//
// WATCHER TASK
//

gulp.task('watch', function() {
  gulp.watch(dist.files, ['scripts:dist']);
  gulp.watch(vendor.files, ['scripts:vendor']);
  gulp.watch(css.files, ['stylesheet:dist']);
  gulp.watch(css.files, ['stylesheet:demo']);
});

//
// TASK ALIAS'
//

gulp.task('js', ['scripts:dist', 'scripts:vendor']);
gulp.task('less', ['stylesheet:dist', 'stylesheet:demo']);
gulp.task('uber', ['scripts:dist', 'scripts:vendor', 'stylesheet:dist', 'stylesheet:demo', 'watch']);
