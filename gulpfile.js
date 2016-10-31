var gulp = require('gulp');
var bump = require('gulp-bump');
var ts = require('gulp-typescript');
var merge = require('merge2');
var clean = require('gulp-clean')
var childProcess = require('child_process')
var tsProject = ts.createProject('tsconfig.json');
gulp.task('clean', function(){
    return gulp.src('./build').pipe(clean());
});

gulp.task('compile', ['compileIndex', 'compileExample'],function() {
    var tsResult = gulp.src('src/**/*.ts').pipe(tsProject());
    return merge([
        tsResult.dts.pipe(gulp.dest('./build/src')),
        tsResult.js.pipe(gulp.dest('./build/src'))
    ]);
});

gulp.task('compileIndex', function() {
    var tsResultIndex = gulp.src('./*.ts').pipe(tsProject());
    return merge([ 
        tsResultIndex.dts.pipe(gulp.dest('./build')),
        tsResultIndex.js.pipe(gulp.dest('./build'))        
    ]);
});

gulp.task('compileExample', function() {
    var tsProject = ts.createProject('tsconfig.json');
    var tsResult = gulp.src('./example/*.ts').pipe(tsProject());
    return merge([ 
        tsResult.dts.pipe(gulp.dest('./build/example')),
        tsResult.js.pipe(gulp.dest('./build/example')),
        gulp.src("./example/*.ts").pipe(gulp.dest('./build/example'))        
    ]);
});

gulp.task('bump', function(){
    return gulp.src('./package.json')
        .pipe(bump())
        .pipe(gulp.dest('./'))
});

gulp.task('copyfiles', function(){
    return merge([
        gulp.src('.npmignore').pipe(gulp.dest('./build/')),
        gulp.src('package.json').pipe(gulp.dest('./build/'))
    ])
});

gulp.task('publish', ['bump', 'compile', 'copyfiles'], function (done) {
  childProcess
    .spawn('npm', ['publish'], { stdio: 'inherit', cwd:'./build' })
    .on('close', done);
});

gulp.task('default', ['compile', 'copyfiles'], function(){});

gulp.task('server', ['compile', 'copyfiles'],function (cb) {
  childProcess
  .exec('node build/example/server.js', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});