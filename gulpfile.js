
var
	gulp = require('gulp'),
	file = require('gulp-file'),
	rollup = require('gulp-better-rollup'),
	babel = require('rollup-plugin-babel'),

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
	babelPresetEs2015 = require('babel-preset-es2015'),
	runSequence = require('run-sequence'),
	svgmin = require('gulp-svgmin'),
	sourcemaps = require('gulp-sourcemaps')
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

gulp.task('rollup', function() {
  gulp.src(paths.es6.src + '/main.js')
    .pipe(sourcemaps.init())
    .pipe(rollup({
      // notice there is no `entry` option as rollup integrates into gulp pipeline 
      plugins: [babel()]
    }, {
      // also rollups `sourceMap` option is replaced by gulp-sourcemaps plugin 
      format: 'umd',
    }))
    // inlining the sourcemap into the exported .js file 
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.es6.dest));
});

gulp.task('es6', function() {
	return rollup(paths.es6.src + '/main.js')
	.pipe(sourcemaps.init())
	.pipe(rollup({
		plugins:[
			babel({
				exclude: 'node_modules/**',
				presets: ['es2015-rollup']
			}),
		]} 
	))
	.pipe(sourcemaps.write(paths.es6.dest))
	.pipe(gulp.dest(paths.es6.dest));

	// return gulp.src(paths.es6.src + "/**/*.js")
	// .pipe(babel({
	// 	presets: ['es2015']
	// 	}).on('error', notify.onError({message:'ERR es6: <%=error.message%>'}))//errorAlert('es6'))
	// )
	// .pipe(concat('_es6.js'))
	// .pipe(gulp.dest(paths.es6.dest))
	// .on('error', errorAlert('es6'))
	// .pipe(notify("es6 completed"));
});

// gulp.task('es6', function(cb) {
// 	runSequence('es6-build', cb);
// });

// gulp.task('merge', function() {
// 	return gulp.src([paths.es6.dest + '/_*.js'])
// 		.pipe(concat('main.js'))
// 		.pipe(wrapper({
// 			header: "(function() {\n",
// 			footer: "\n})();"
// 		}))
// 		.pipe(gulp.dest(paths.es6.dest))
// 		.pipe(rename({suffix:".min"}))
// 		.pipe(uglify())
// 		.pipe(gulp.dest(paths.es6.dest))
// 		;
// });

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
	.pipe(gulp.dest(paths.scss.dest))
	.pipe(rename({suffix:".min"}))
	.pipe(nano())
	.pipe(gulp.dest('public/css'));
});

gulp.task('svgmin', function () {
    return gulp.src(paths.svg.src + '/*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest(paths.svg.dest));
});

gulp.task('watch', function() {
	gulp.watch(paths.es6.src + '/**/*.js', ['es6']);
	gulp.watch([paths.dtemplate.src + '/**/*.html'], ['dtemplate']);
	gulp.watch(paths.scss.src + '/**/*.scss', ['scss']);
});
