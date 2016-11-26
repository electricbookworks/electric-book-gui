var
	gulp = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'),
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
	babel = require('gulp-babel'),
	sass = require('gulp-sass'),
	babelPresetEs2015 = require('babel-preset-es2015'),
	runSequence = require('run-sequence')
	;
	
var hreq = require;
var exec = hreq('child_process').exec;

var paths = {
	es6: {
		src: "src/es6",
		dest: "public/js",
	},
	dtemplate: {
		src: 'src/es6'
	},
	scss: {
		src: 'src/scss',
		dest: 'public/css',
		include: [
				'lib/bower_components/',
				'public/bower_components/',
		]
	}
};

function errorAlert(task) {
	return function(error) {
		console.error("ERROR in task: " + error.message);
		notify.onError({message:'ERR ' + task + ': ' + error.message});
		this.emit('end');
	};
}

gulp.task('es6-build', function() {
	return gulp.src(paths.es6.src + "/**/*.js")
	.pipe(babel({
		presets: ['es2015']
		}).on('error', notify.onError({message:'ERR es6: <%=error.message%>'}))//errorAlert('es6'))
	)
	.pipe(concat('_es6.js'))
	.pipe(gulp.dest(paths.es6.dest))
	.on('error', errorAlert('es6'))
	.pipe(notify("es6 completed"));
});

gulp.task('es6', function(cb) {
	runSequence('es6-build','merge', cb);
});

gulp.task('merge', function() {
	return gulp.src([paths.es6.dest + '/_*.js'])
		.pipe(concat('main.js'))
		.pipe(wrapper({
			header: "(function() {\n",
			footer: "\n})();"
		}))
		.pipe(gulp.dest(paths.es6.dest))
		.pipe(rename({suffix:".min"}))
		.pipe(uglify())
		.pipe(gulp.dest(paths.es6.dest))
		;
});

gulp.task('dtemplate-build', function(cb) {
  exec('dtemplate -dir ' + paths.dtemplate.src + ' -out ' + paths.es6.src + 
  		'/DTemplate.js -include-query-select no ', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('dtemplate', function(cb) {
	runSequence('dtemplate-build','es6', cb);
});
  
gulp.task('scss', function() {
	return gulp.src(paths.scss.src + '/main.scss')
	.pipe(concat('main.css'))
	.pipe(sass({includePaths:paths.scss.include}).on('error', sass.logError))
	.pipe(autoprefixer({
		browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3'],
		cascade: false
	 }))
	.pipe(gulp.dest(paths.scss.dest))
	.pipe(rename({suffix:".min"}))
	.pipe(nano())
	.pipe(gulp.dest('public/css'));
});

gulp.task('watch', function() {
	gulp.watch(paths.es6.src + '/**/*.js', ['es6']);
	gulp.watch([paths.dtemplate.src + '/**/*.html'], ['dtemplate']);
	gulp.watch(paths.scss.src + '/**/*.scss', ['scss']);
});
