var gulp = require('gulp');
//var karma = require('karma').server;
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var path = require('path');
var plumber = require('gulp-plumber');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint');
var map = require('map-stream');
var notify = require('gulp-notify');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var buffer = require('vinyl-buffer');
var ngAnnotate = require('gulp-ng-annotate');

/**
 * File patterns
 **/

// Root directory
var rootDirectory = path.resolve('./');

// Source directory for build process
var sourceDirectory = path.join(rootDirectory, './src');

var sourceFiles = [

  // Make sure module files are handled first
  path.join(sourceDirectory, '/**/*.module.js'),

  // Then add all JavaScript files
  path.join(sourceDirectory, '/**/*.js')
];


gulp.task('build', function() {
  var browserified = transform(function(filename) {
    var b = browserify(filename);
    return b.bundle();
  });
  gulp.src(sourceFiles)
    .pipe(plumber())
    .pipe(concat('angular-bing-maps.js'))
    .pipe(ngAnnotate({single_quotes: true}))
    .pipe(gulp.dest('./dist'))
    //.pipe(buffer())
    .pipe(browserified)
    .pipe(gulp.dest('./dist'))
    .pipe(uglify())
    .pipe(rename('angular-bing-maps.min.js'))
    .pipe(gulp.dest('./dist'))
});

/**
 * Process
 */
gulp.task('process-all', function (done) {
  runSequence('jshint-src', 'build', done)
});

/**
 * Watch task
 */
gulp.task('watch', function () {

  // Watch JavaScript files
  gulp.watch(sourceFiles, ['process-all']);
});

/**
 * Validate source JavaScript
 */
gulp.task('jshint-src', function () {
  return gulp.src(sourceFiles)
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
//    .on('error', notify.onError(function (error) {
//      return error.message;
//    }));
});

/**
 * Run test once and exit
 */
gulp.task('test-src', function (done) {
  karma.start({
    configFile: __dirname + '/karma-src.conf.js',
    singleRun: true
  }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-concatenated', function (done) {
  karma.start({
    configFile: __dirname + '/karma-dist-concatenated.conf.js',
    singleRun: true
  }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-minified', function (done) {
  karma.start({
    configFile: __dirname + '/karma-dist-minified.conf.js',
    singleRun: true
  }, done);
});

gulp.task('default', function () {
  runSequence('process-all', 'watch')
});
