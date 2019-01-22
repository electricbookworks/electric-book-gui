// This gulpfile processes:
// - images, optimising them for output formats
// - Javascript, optionally, minifying scripts for performance.
// It does not lint JS. Contributors should use JSLint
// in their own editors to ensure consistency.
// Note: gulp-responsive-images requires GraphicsMagick to be installed.
// See https://github.com/dcgauld/gulp-responsive-images for details.

// Get Node modules
var gulp = require('gulp'),
    responsive = require('gulp-responsive-images'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    newer = require('gulp-newer'),
    gm = require('gulp-gm'),
    svgmin = require('gulp-svgmin'),
    fileExists = require('file-exists'),
    debug = require('gulp-debug');

// Set up paths.
var paths = {
    img: {
        source: '_source/images/',
        output: 'images/'
    },
    js: {
        src: 'js/',
        dest: 'js/'
    }
};

// Set bitmap filetypes to convert, comma separated, no spaces.
// (SVG will be handled separately.)
var filetypes = 'jpg,jpeg,gif,png';

// User guidance
console.log('If you\'re having trouble with image conversions, check that you have GraphicsMagick installed (http://www.graphicsmagick.org/).');

// Minify and clean SVGs and copy to destinations.
gulp.task('images:svg', function (done) {
    'use strict';
    console.log('Processing SVG images from ' + paths.img.source);
    gulp.src(paths.img.source + '*.svg')
        .pipe(debug({title: 'Processing SVG '}))
        .pipe(svgmin({
            plugins: [{
                removeAttrs: {attrs: 'data.*'}
            }, {
                removeUnknownsAndDefaults: {
                    defaultAttrs: false
                }
            }]
        }).on('error', function (e) {
            console.log(e);
        }))
        .pipe(gulp.dest(paths.img.output));
    done();
});

// Optimise and resize bitmap images
gulp.task('images:optimise', function (done) {
    'use strict';
    console.log('Optimising images from ' + paths.img.source);
    if (fileExists.sync('_tools/profiles/sRGB_v4_ICC_preference_displayclass.icc')) {
        gulp.src(paths.img.source + '*.{' + filetypes + '}')
            .pipe(newer(paths.img.output))
            .pipe(debug({title: 'Optimising '}))
            .pipe(responsive({
                '*': [{
                    width: 810,
                    quality: 90,
                    upscale: false
                }]
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gm(function (gmfile) {
                return gmfile.profile('_tools/profiles/sRGB_v4_ICC_preference_displayclass.icc').colorspace('rgb');
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(paths.img.output));
    } else {
        console.log('Colour profile _tools/profiles/sRGB_v4_ICC_preference_displayclass.icc not found. Exiting.');
        return;
    }
    done();
});

// Make small size images for use in srcset in _includes/figure
gulp.task('images:small', function (done) {
    'use strict';
    console.log('Creating small images from ' + paths.img.source);
    if (fileExists.sync('_tools/profiles/sRGB_v4_ICC_preference_displayclass.icc')) {
        gulp.src(paths.img.source + '*.{' + filetypes + '}')
            .pipe(newer(paths.img.output))
            .pipe(debug({title: 'Creating small '}))
            .pipe(responsive({
                '*': [{
                    width: 320,
                    quality: 90,
                    upscale: false,
                    suffix: '-320'
                }]
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gm(function (gmfile) {
                return gmfile.profile('_tools/profiles/sRGB_v4_ICC_preference_displayclass.icc').colorspace('rgb');
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(paths.img.output));
    } else {
        console.log('Colour profile _tools/profiles/sRGB_v4_ICC_preference_displayclass.icc not found. Exiting.');
        return;
    }
    done();
});

// Make medium size images for use in srcset in _includes/figure
gulp.task('images:medium', function (done) {
    'use strict';
    console.log('Creating medium-sized images from ' + paths.img.source);
    if (fileExists.sync('_tools/profiles/sRGB_v4_ICC_preference_displayclass.icc')) {
        gulp.src(paths.img.source + '*.{' + filetypes + '}')
            .pipe(newer(paths.img.output))
            .pipe(debug({title: 'Creating medium '}))
            .pipe(responsive({
                '*': [{
                    width: 640,
                    quality: 80,
                    upscale: false,
                    suffix: '-640'
                }]
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gm(function (gmfile) {
                return gmfile.profile('_tools/profiles/sRGB_v4_ICC_preference_displayclass.icc').colorspace('rgb');
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(paths.img.output));
    } else {
        console.log('Colour profile _tools/profiles/sRGB_v4_ICC_preference_displayclass.icc not found. Exiting.');
        return;
    }
    done();
});

// Make large size images for use in srcset in _includes/figure
gulp.task('images:large', function (done) {
    'use strict';
    console.log('Creating large images from ' + paths.img.source);
    if (fileExists.sync('_tools/profiles/sRGB_v4_ICC_preference_displayclass.icc')) {
        gulp.src(paths.img.source + '*.{' + filetypes + '}')
            .pipe(newer(paths.img.output))
            .pipe(debug({title: 'Creating large '}))
            .pipe(responsive({
                '*': [{
                    width: 1024,
                    quality: 80,
                    upscale: false,
                    suffix: '-1024'
                }]
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gm(function (gmfile) {
                return gmfile.profile('_tools/profiles/sRGB_v4_ICC_preference_displayclass.icc').colorspace('rgb');
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(paths.img.output));
    } else {
        console.log('Colour profile _tools/profiles/sRGB_v4_ICC_preference_displayclass.icc not found. Exiting.');
        return;
    }
    done();
});

// Make extra-large images
gulp.task('images:xlarge', function (done) {
    'use strict';
    console.log('Creating extra-large images from ' + paths.img.source);
    if (fileExists.sync('_tools/profiles/sRGB_v4_ICC_preference_displayclass.icc')) {
        gulp.src(paths.img.source + '*.{' + filetypes + '}')
            .pipe(newer(paths.img.output))
            .pipe(debug({title: 'Creating extra-large '}))
            .pipe(responsive({
                '*': [{
                    width: 2048,
                    quality: 90,
                    upscale: false,
                    suffix: '-2048'
                }]
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gm(function (gmfile) {
                return gmfile.profile('_tools/profiles/sRGB_v4_ICC_preference_displayclass.icc').colorspace('rgb');
            }).on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(paths.img.output));
    } else {
        console.log('Colour profile _tools/profiles/sRGB_v4_ICC_preference_displayclass.icc not found. Exiting.');
        return;
    }
    done();
});

// Minify JS files to make them smaller,
// using the drop_console option to remove console logging
gulp.task('js', function (done) {
    'use strict';

    if (paths.js.src.length > 0) {
        console.log('Minifying Javascript');
        gulp.src(paths.js.source)
            .pipe(debug({title: 'Minifying '}))
            .pipe(uglify({compress: {drop_console: true}}).on('error', function (e) {
                console.log(e);
            }))
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest(paths.js.output));
        done();
    } else {
        console.log('No scripts in source list to minify.');
        done();
    }
});

// when running `gulp`, do the image tasks
gulp.task('default', gulp.series(
    'images:svg',
    'images:optimise',
    'images:small',
    'images:medium',
    'images:large',
    'images:xlarge'
));
