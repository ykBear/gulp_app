var gulp = require('gulp'),
  gulpif = require('gulp-if'),
  htmlmin = require('gulp-htmlmin');
  livereload = require('gulp-livereload'),
  args = require('./tasks/args'), //将args参数作为依赖项加入
  concat = require('gulp-concat'),
  named = require('vinyl-named'),
  plumber = require('gulp-plumber'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),
  cssmin = require('gulp-clean-css'),
  del = require('del'),
  gulpSequence = require('gulp-sequence'),
  gutil = require('gulp-util'),
  webserver= require('gulp-webserver');
  // liveserver = require('gulp-live-server');



/**
 * 处理
 * @return {[type]} [description]
 */

//处理html
gulp.task('pages', function(){
    var options = {
       removeComments: true,//清除HTML注释
       collapseWhitespace: true,//压缩HTML
       collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
       removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
       removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
       removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
       minifyJS: true,//压缩页面JS
       minifyCSS: true//压缩页面CSS
     };
    return gulp.src('app/**/*.html')
      .pipe(htmlmin(options))
      .pipe(gulp.dest('dist'))
      .pipe(gulpif(args.watch, livereload()));
  });

//处理js
gulp.task('scripts', function() {
  return gulp.src(['app/js/*.js'])
    .pipe(plumber({
      errorHandle: function() {

      }
    }))
    .pipe(named())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe(gulpif(args.watch, livereload()))
});

//处理css
gulp.task('css',()=>{
  return gulp.src('app/css/*.css')
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(cssmin({
    advanced: false,   //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）
    keepBreaks: false,   //换行
    keepSpecialComments: '*',
    compatibility: 'ie7'
  }))
  .pipe(gulp.dest('dist/css'))
  .pipe(gulpif(args.watch,livereload()))
})

//清空文件
gulp.task('clean',function(){
  return del(['dist/css','dist/js','dist/views'])
});

//自动更新
gulp.task('browser',(cb)=>{
  if(!args.watch) return cb();
  gulp.watch('app/**/*.js',['scripts']);
  gulp.watch('app/**/*.html',['pages']);
  gulp.watch('app/**/*.css',['css']);
});

//服务器
gulp.task('webserver', function() {
  gulp.src( 'app/views' ) // 服务器目录（.代表根目录）
  .pipe(webserver({ // 运行gulp-webserver
    livereload: true, // 启用LiveReload
    open: true, // 服务器启动时自动打开网页
    port:2333
  }))
  .pipe(gulpif(args.watch,livereload()))
});

//执行顺序
gulp.task('build',gulpSequence('clean','css','pages','scripts',['browser','webserver']));

//简单化命令
gulp.task('default',['build']);
