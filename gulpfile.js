var
	gulp = require('gulp'),
	concat = require('gulp-concat'),
	nano = require('gulp-cssnano'),
	uglify =require('gulp-uglify'),
	rename = require('gulp-rename'),
	watch = require('gulp-watch'),
	notify = require('gulp-notify'),
	gutil = require('gulp-util'),
	gulpIf = require('gulp-if'),
	wrapper = require('gulp-wrapper'),
	merge = require('gulp-merge'),
	sass = require('gulp-sass'),
	svgmin = require('gulp-svgmin')
	;

var hreq = require;
var exec = hreq('child_process').exec;

var paths = {
	scss: {
		src: 'src/scss',
		dest: 'public/css',
		include: [
				'lib/bower_components/',
				'public/bower_components/',
		]
	},
	svg: {
		src: 'src/img',
		dest: 'public/css/img'
	}
};

function errorAlert(task) {
	return function(error) {
		console.error("ERROR in task: " + error.message);
		notify.onError({message:'ERR ' + task + ': ' + error.message});
		this.emit('end');
	};
}
gulp.task('scss', function(done) {
	return gulp.src(paths.scss.src + '/main.scss')
	.pipe(concat('main.css'))
	.pipe(sass({includePaths:paths.scss.include}).on('error', sass.logError))
	.pipe(gulp.dest(paths.scss.dest))
	.pipe(rename({suffix:".min"}))
	.pipe(nano())
	.pipe(gulp.dest('public/css'));
	done();
});



gulp.task('svgmin', function (done) {
    return gulp.src(paths.svg.src + '/*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest(paths.svg.dest));
        done();
});

gulp.task('watch', function(done) {
	gulp.watch(paths.scss.src + '/**/*.scss', gulp.series('scss'));
	done();
});

// when running `gulp`, do these tasks
gulp.task('default', gulp.series(
    'scss',
    'svgmin'
));
