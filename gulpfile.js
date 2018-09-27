var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleancss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    notify = require("gulp-notify"),
    rsync = require('gulp-rsync');
fileinclude = require('gulp-file-include'),
    rigger = require('gulp-rigger'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    babel = require('gulp-babel');


var PATH = {
    dst: 'app/dist/',
    src: 'app/src/',
    slick: 'node_modules/slick-carousel/slick/'
};

gulp.task('browser-sync', function () {
    browserSync.init({
        server: "./app/dist"
    });

});

gulp.task('styles', function () {
    return gulp.src(PATH.src + 'styles/app.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expand'
        }).on("error", notify.onError()))
        // .pipe(rename({suffix: '.min', prefix: ''}))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(cleancss({
            level: {
                1: {
                    specialComments: 0
                }
            }
        })) // Opt., comment out when debugging
        .pipe(concat('app.css'))
        .pipe(sourcemaps.write())
        .pipe(plumber.stop())
        .pipe(gulp.dest(PATH.dst + 'css'))
        .pipe(browserSync.stream())
});

gulp.task('js', function () {
    return gulp.src(PATH.src + 'js/**/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(rigger())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(plumber.stop())
        .pipe(gulp.dest(PATH.dst + 'js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// gulp.task('fonts', function () {
//     return gulp.src([PATH.src + 'fonts/**/*', PATH.slick + 'fonts/**/*' ])
//         .pipe(gulp.dest( PATH.dst + 'fonts' ))
//         .pipe(browserSync.reload({stream: true}))
// });


gulp.task('html', function () {
    return gulp.src(PATH.src + 'index.html')
        .pipe(plumber())
        .pipe(rigger())
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(plumber.stop())
        .pipe(gulp.dest(PATH.dst))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('rsync', function () {
    return gulp.src('app/**')
        .pipe(rsync({
            root: 'app/',
            hostname: 'username@yousite.com',
            destination: 'yousite/public_html/',
            // include: ['*.htaccess'], // Includes files to deploy
            exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
            recursive: true,
            archive: true,
            silent: false,
            compress: true
        }))
});

gulp.task('imagemin', function () {
    return gulp.src(PATH.src + 'img/**/*')
        .pipe(cache(imagemin())) // Cache Images
        .pipe(gulp.dest(PATH.dst + 'img'));
});


gulp.task('watch', ['styles', 'js', /*'fonts',*/ 'imagemin', 'html', 'browser-sync'], function () {
    gulp.watch(PATH.src + 'styles/**/*.scss', ['styles']);
    gulp.watch(PATH.src + "index.html", ['html']);
    gulp.watch([PATH.src + 'js/app.js'], ['js']);
    gulp.watch([PATH.src + 'fonts/**/*'], ['fonts']);
    gulp.watch([PATH.src + 'img/**/*'], ['imagemin']);
});

gulp.task('default', ['watch']);