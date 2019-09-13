var gulp = require('gulp')
var del = require('del')
var autoprefixer = require('gulp-autoprefixer')
var browserSync = require('browser-sync')
var sass = require('gulp-sass')
var concat = require('gulp-concat')
var rename = require('gulp-rename')
var imagemin = require('gulp-imagemin')
var plumber = require('gulp-plumber')
var csso = require('gulp-csso')
var sourcemaps = require('gulp-sourcemaps')
var uncss = require('gulp-uncss')
var uglify = require('gulp-uglify-es').default
var webpack = require('webpack')
var webpackStream = require('webpack-stream')

var paths = {
  dirs: {
    build: './build'
  },
  html: {
    src: ['./src/pages/*.html', './src/index.html'],
    dest: './build',
    watch: ['./src/pages/*.html', './src/index.html']
  },
  css: {
    src: './src/styles/style.scss',
    dest: './build/css',
    watch: ['./src/styles/**/*.scss', './src/styles/*.scss']
  },
  js: {
    src: [
      './src/scripts/plugins.js',
      './src/scripts/pages/*.js',
      './src/scripts/index.js'
    ],
    dest: './build/js',
    watch: './src/scripts/**/*.js'
  },
  images: {
    src: './src/images/*',
    dest: './build/img',
    watch: './src/images/*'
  },
  fonts: {
    src: './src/fonts/*',
    dest: './build/fonts',
    watch: './src/fonts/*'
  }
}

gulp.task('clean', function () {
  return del(paths.dirs.build)
})

gulp.task('templates', function () {
  return gulp
    .src(paths.html.src)
    .pipe(plumber())
    .pipe(gulp.dest(paths.html.dest))
    .pipe(
      browserSync.reload({
        stream: true
      })
    )
})

gulp.task('styles', function () {
  return gulp
    .src(paths.css.src)
    .pipe(plumber())
    .pipe(sass())
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions']
      })
    )
    .pipe(gulp.dest(paths.css.dest))
    .pipe(sourcemaps.init())
    .pipe(csso())
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.css.dest))
    .pipe(
      browserSync.reload({
        stream: true
      })
    )
})

gulp.task('scripts', function () {
  return gulp
    .src(paths.js.src)
    .pipe(plumber())
    .pipe(
      webpackStream({
        output: {
          filename: 'scripts.js'
        },
        module: {
          rules: [
            {
              test: /\.(js)$/,
              exclude: /(node_modules)/,
              loader: 'babel-loader',
              query: {
                presets: ['env']
              }
            }
          ]
        }
      })
    )
    .pipe(gulp.dest(paths.js.dest))
    .pipe(uglify())
    .pipe(sourcemaps.init())
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.js.dest))
    .pipe(
      browserSync.reload({
        stream: true
      })
    )
})

gulp.task('images', function () {
  return gulp
    .src(paths.images.src)
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(
      rename({
        dirname: ''
      })
    )
    .pipe(gulp.dest(paths.images.dest))
})

gulp.task('fonts', function () {
  return gulp
    .src(paths.fonts.src)
    .pipe(plumber())
    .pipe(gulp.dest(paths.fonts.dest))
    .pipe(
      browserSync.reload({
        stream: true
      })
    )
})

gulp.task('server', function () {
  browserSync.init({
    server: {
      baseDir: paths.dirs.build
    },
    reloadOnRestart: true,
    tunnel: 'remote'
  })
  gulp.watch(paths.html.watch, gulp.parallel('templates'))
  gulp.watch(paths.css.watch, gulp.parallel('styles'))
  gulp.watch(paths.js.watch, gulp.parallel('scripts'))
  gulp.watch(paths.images.watch, gulp.parallel('images'))
  gulp.watch(paths.fonts.watch, gulp.parallel('fonts'))
})

gulp.task(
  'build',
  gulp.series('clean', 'templates', 'styles', 'scripts', 'images', 'fonts')
)

gulp.task('dev', gulp.series('build', 'server'))
