'use strict'
import gulp from 'gulp'
import browserSync from'browser-sync'
import gulpLoadPlugins from 'gulp-load-plugins'
import pkg from'./package.json'

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const browserSyncSettings = {
    notify: false,
    logPrefix: 'JMM',
    server: {baseDir: '_site'},
};
// Set the banner content
const banner = ['/*!\n',
    ' * Joseph\'s Site - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2015-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
    ' */\n',
    ''
].join('');

// Compile LESS files from /less into /css
gulp.task('less', () => (
    gulp.src('less/new-age.less')
        .pipe($.less())
        .pipe($.header(banner, { pkg: pkg }))
        .pipe(gulp.dest('css'))
        .pipe(reload({
            stream: true
        }))
));

// Minify compiled CSS
gulp.task('minify-css', ['less'], ()  => (
    gulp.src('css/new-age.css')
        .pipe($.cleanCss({ compatibility: 'ie8' }))
        .pipe($.rename({ suffix: '.min' }))
        .pipe(gulp.dest('css'))
        .pipe(reload({
            stream: true
        }))
));

// Minify JS
gulp.task('minify-js', () => (
    gulp.src('js/new-age.js')
        .pipe($.uglify())
        .pipe($.header(banner, { pkg: pkg }))
        .pipe($.rename({ suffix: '.min' }))
        .pipe(gulp.dest('js'))
        .pipe(reload({
            stream: true
        }))
));

// Copy vendor libraries from /node_modules into /vendor
gulp.task('copy', (done) => {
    gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest('vendor/bootstrap'));

    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('vendor/jquery'));

    gulp.src(['node_modules/simple-line-icons/*/*'])
        .pipe(gulp.dest('vendor/simple-line-icons'));


    gulp.src([
            'node_modules/font-awesome/**',
            '!node_modules/font-awesome/**/*.map',
            '!node_modules/font-awesome/.npmignore',
            '!node_modules/font-awesome/*.txt',
            '!node_modules/font-awesome/*.md',
            '!node_modules/font-awesome/*.json'
        ])
        .pipe(gulp.dest('vendor/font-awesome'));
    done();
});

// Run everything
gulp.task('default', ['less', 'minify-css', 'minify-js', 'copy']);

// Configure the browserSync task
gulp.task('browserSync', () => (
    browserSync(browserSyncSettings)
));

// Dev task with browserSync
gulp.task('dev', ['browserSync', 'less', 'minify-css', 'minify-js'], () => {
    gulp.watch('less/*.less', ['less']);
    gulp.watch('css/*.css', ['minify-css']);
    gulp.watch('js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('_site/*.html', reload);
    gulp.watch('_site/js/**/*.js', reload);
});
