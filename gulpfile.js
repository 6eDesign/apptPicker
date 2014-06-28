// gulp task dependencies
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var livereload = require('gulp-livereload');
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
    // .pipe(uglify())
    .pipe(concat(dist.outfile))
    .pipe(gulp.dest(output + 'js/'))
    .pipe(livereload());
});

// 
// VENDOR PATHS
// 
var vendor = {
  outfile: 'vendor.min.js',
  files: [
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
    .pipe(gulp.dest(output + 'js/'))
    .pipe(livereload());
});

//
// Demo JS Paths
//
var demojs = { 
  outfile: 'demo.min.js', 
  files: [ 
    input + 'js/jquery.min.js',
    input + 'js/jquery.easing.min.js',  
    input + 'js/timeUtils.js',
    input + 'js/jDom.js', 
    input + 'js/jDom.interpret.js', 
    input + 'js/apptPicker.js',   
    input + 'js/rainbow-custom.min.js'
  ]
}; 

//
// Demo JS TASK
//
gulp.task('scripts:demo', function(){
  return gulp.src(demojs.files) 
    // .pipe(uglify())
    .pipe(concat(demojs.outfile))
    .pipe(gulp.dest(output + 'js/'))
    .pipe(livereload());   
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
    .pipe(gulp.dest(output + 'css/'))
    .pipe(livereload());
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
    .pipe(gulp.dest(output + 'css/'))
    .pipe(livereload());
});

//
// HTML Task
//
gulp.task('html', function(){
  return gulp.src('*.html')
  .pipe(gulp.dest(''))
  .pipe(livereload())
  .pipe(notify({message: 'html task complete'})); 
}); 

//
// WATCHER TASK
//

gulp.task('watch', function() {
  gulp.watch(dist.files, ['scripts:dist']);
  gulp.watch(vendor.files, ['scripts:vendor']);
  gulp.watch(demojs.files, ['scripts:demo']);
  gulp.watch(css.files, ['stylesheet:dist']);
  gulp.watch(css.files, ['stylesheet:demo']);
  gulp.watch('*.html', ['html']); 
});

//
// TASK ALIAS'
//

gulp.task('js', ['scripts:dist', 'scripts:vendor', 'scripts:demo']);
gulp.task('less', ['stylesheet:dist', 'stylesheet:demo']);
gulp.task('uber', ['scripts:dist', 'scripts:vendor', 'scripts:demo', 'stylesheet:dist', 'stylesheet:demo', 'watch']);
