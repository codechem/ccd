var gulp = require('gulp');
var bump = require('gulp-bump');
var ts = require('gulp-typescript');
var merge = require('merge2');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
var childProcess = require('child_process');
var tsProject = ts.createProject('tsconfig.json');
var tslint = require("gulp-tslint");

// const OUTPUT_DIR_FLEET= '/Users/dulepop-andov/projects/cc/ccfleet/server/node_modules/ccd'
// const OUTPUT_DIR_EXAMPLE = './example/node_modules/ccd'
const OUTPUT_DIR = './build'
gulp.task('clean', function(){
    return gulp.src(OUTPUT_DIR).pipe(clean());
});

gulp.task('compile', ['tslint','compileIndex', 'compileExample'],function() {
    var tsResult = gulp.src('src/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    return merge([
        tsResult.dts.pipe(gulp.dest(OUTPUT_DIR+'/src')),
        tsResult.js
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(OUTPUT_DIR+'/src'))
    ]);
});

gulp.task('tslint', function(){
    gulp.src('src/**/*.ts')
        .pipe(tslint({formatter: "verbose"}))
        .pipe(tslint.report())
});

gulp.task('compileIndex', function() {
    var tsResultIndex = gulp.src('./*.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    return merge([ 
        tsResultIndex.dts.pipe(gulp.dest(OUTPUT_DIR)),
        tsResultIndex.js
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(OUTPUT_DIR))
    ]);
});

gulp.task('compileExample', function() {
    var tsProject = ts.createProject('tsconfig.json');
    var tsResult = gulp.src('./example/*.ts')
        .pipe(sourcemaps.init('.'))
        .pipe(tsProject());
    return merge([ 
        tsResult.dts.pipe(gulp.dest(OUTPUT_DIR+'/example')),
        tsResult.js.pipe(gulp.dest(OUTPUT_DIR+'/example')),
        gulp.src("./example/*.ts").pipe(gulp.dest(OUTPUT_DIR+'/example'))        
    ]);
});

gulp.task('bump', function(){
    return gulp.src('./package.json')
        .pipe(bump())
        .pipe(gulp.dest('./'))
});

gulp.task('copyfiles', function(){
    return merge([
        gulp.src('.npmignore').pipe(gulp.dest(OUTPUT_DIR)),
        gulp.src('package.json').pipe(gulp.dest(OUTPUT_DIR))
    ])
});

gulp.task('publish', ['bump', 'compile', 'copyfiles'], function (done) {
  childProcess
    .spawn('npm', ['publish'], { stdio: 'inherit', cwd:OUTPUT_DIR })
    .on('close', done);
});

gulp.task('default', ['compile', 'copyfiles'], function(){});

gulp.task('server', ['compile', 'copyfiles'],function (cb) {
  childProcess
  .exec('node '+OUTPUT_DIR+'/example/server.js', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});