'use strict'
import del from 'del'
import gulp from 'gulp'
import pkg from'./package.json'
import browserSync from'browser-sync'
import runSequence from 'run-sequence'
import childProcess from 'child_process'
import gulpLoadPlugins from 'gulp-load-plugins'

// Load all gulp-x plugins
const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// BrowserSync Settings
const browserSyncSettings = {
    notify: false,
    logPrefix: 'JMM',
    server: {baseDir: 'build'},
};

// Log Jekyll Output if it is not blank
const jekyllLogger = (buffer) => {
    buffer.toString()
        .split(/\n/)
        .map((message) => {
            if(message) {$.util.log('Jekyll: ' + message)}
      });
};

// Set the banner content
const banner = ['/*\n',
    ' * Joseph\'s Site - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2015-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' */\n',
    ''
].join('');

// Minify JS
gulp.task('minify-js', () => {
    gulp.src([
          'app/js/**/*.js',
          '!app/js/**/*.min.js',
        ])
        .pipe($.uglify())
        .pipe($.header(banner, { pkg: pkg }))
        .pipe($.rename({ suffix: '.min' }))
        .pipe(gulp.dest('build/js'))
        .pipe(reload({
            stream: true
    }));
});

gulp.task('clean', (done) => {
    del(["build", "app/vendor", "app/.jekyll-metadata", ".sass-cache"]);
    done();
});

// Copy vendor libraries from /node_modules into /vendor
gulp.task('copy', (done) => {
    // Bootstrap
    gulp.src(['node_modules/bootstrap/dist/**/*.min.*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest('app/vendor/bootstrap'));
    gulp.src(['node_modules/bootstrap/dist/fonts/**/*'])
        .pipe(gulp.dest('app/vendor/bootstrap/fonts'))

    // jQuery
    gulp.src(['node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('app/vendor/jquery'));

    // FontAwesome
    gulp.src([
            'node_modules/font-awesome/**/*min.css',
            'node_modules/font-awesome/**/fonts/**',
        ])
        .pipe(gulp.dest('app/vendor/font-awesome'));

    // WowJS
    gulp.src([
            'node_modules/wowjs/dist/wow.min.js',
        ])
        .pipe(gulp.dest('app/vendor/wowjs'));
    done();
});

// Jekyll Build
gulp.task('jekyll-build', (done) => {
    const jekyllBuild = childProcess.spawn('bundle', ['exec', 'jekyll', 'build']);
    jekyllBuild.stdout.on('data', jekyllLogger);
    jekyllBuild.stderr.on('data', jekyllLogger);
    done();
});

// Build everything
gulp.task('default', ['minify-js', 'copy'], (done) => {
    runSequence('jekyll-build', done);
});

// Dev task with browserSync
gulp.task('dev', () => {
    runSequence('clean', ['minify-js', 'copy']);
    const jekyllWatch = childProcess.spawn('bundle', ['exec',
        'jekyll',
        'build',
        '--watch',
        '--incremental',
        '--drafts'
    ]);
    jekyllWatch.stdout.on('data', jekyllLogger);
    jekyllWatch.stderr.on('data', jekyllLogger);
    
    browserSync(browserSyncSettings);
    gulp.watch('app/js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or CSS files change
    gulp.watch('build/**/*.html', reload);
    gulp.watch('build/**/*.css', reload);
});
