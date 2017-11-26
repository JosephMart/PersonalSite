'use strict'
import gulp from 'gulp'
import browserSync from'browser-sync'
import gulpLoadPlugins from 'gulp-load-plugins'
import childProcess from 'child_process'
import runSequence from 'run-sequence'
import pkg from'./package.json'

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
const banner = ['/*!\n',
    ' * Joseph\'s Site - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2015-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
    ' */\n',
    ''
].join('');

// Compile LESS files from /less into /css
gulp.task('less', () => (
    gulp.src('app/less/new-age.less')
        .pipe($.less())
        .pipe($.header(banner, { pkg: pkg }))
        .pipe(gulp.dest('app/css'))
        .pipe(reload({
            stream: true
        }))
));

// Minify compiled CSS
gulp.task('minify-css', ['less'], ()  => (
    gulp.src('app/css/new-age.css')
        .pipe($.cleanCss({ compatibility: 'ie8' }))
        .pipe($.rename({ suffix: '.min' }))
        .pipe(gulp.dest('app/css'))
        .pipe(reload({
            stream: true
        }))
));

// Minify JS
gulp.task('minify-js', () => (
    gulp.src('app/js/new-age.js')
        .pipe($.uglify())
        .pipe($.header(banner, { pkg: pkg }))
        .pipe($.rename({ suffix: '.min' }))
        .pipe(gulp.dest('app/js'))
        .pipe(reload({
            stream: true
        }))
));

// Copy vendor libraries from /node_modules into /vendor
gulp.task('copy', (done) => {
    gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest('app/vendor/bootstrap'));

    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('app/vendor/jquery'));

    gulp.src(['node_modules/simple-line-icons/*/*'])
        .pipe(gulp.dest('app/vendor/simple-line-icons'));


    gulp.src([
            'node_modules/font-awesome/**',
            '!node_modules/font-awesome/**/*.map',
            '!node_modules/font-awesome/.npmignore',
            '!node_modules/font-awesome/*.txt',
            '!node_modules/font-awesome/*.md',
            '!node_modules/font-awesome/*.json'
        ])
        .pipe(gulp.dest('app/vendor/font-awesome'));
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
gulp.task('default', ['less', 'minify-css', 'minify-js', 'copy'], (done) => {
    runSequence('jekyll-build', done);
});

// Dev task with browserSync
gulp.task('dev', ['less', 'minify-css', 'minify-js'], () => {
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
    gulp.watch('app/less/*.less', ['less']);
    gulp.watch('app/css/*.css', ['minify-css']);
    gulp.watch('app/js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('build/**/*.html', reload);
    gulp.watch('build/js/**/*.js', reload);
});
