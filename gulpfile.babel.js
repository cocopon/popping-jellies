const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browserify = require('browserify');
const babelify = require('babelify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

const config = {
	js: {
		srcPattern: './src/js/**/*.js',
		entry: './src/js/main.js',
		dstFile: 'sketch.js',
		dstDir: './www/assets/js'
	},
	serverDir: './www'
};

[false, true].forEach((prod) => {
	const postfix = prod ? 'prod' : 'dev';
	gulp.task(`js:${postfix}`, () => {
		return browserify(config.js.entry)
			.transform(babelify, {
				presets: ['es2015']
			})
			.bundle()
			.pipe($.plumber())
			.pipe(source(config.js.dstFile))
			.pipe(buffer())
			.pipe(prod ? $.uglify({
			}) : $.nop())
			.pipe(gulp.dest(config.js.dstDir));
	});

	gulp.task(`watch:${postfix}`, (callback) => {
		gulp.watch(config.js.srcPattern, () => {
			gulp.start([`js:${postfix}`])
				.on('end', callback);
		});
	});
});

gulp.task('webserver', () => {
	return gulp.src(config.serverDir)
		.pipe($.webserver({
			host: '0.0.0.0',
			livereload: true
		}));
});

[false, true].forEach((prod) => {
	const postfix = prod ? 'prod' : 'dev';
	gulp.task(`build:${postfix}`, [`js:${postfix}`]);
	gulp.task(postfix, [`build:${postfix}`, `watch:${postfix}`, 'webserver']);
});

gulp.task('default', ['build:dev']);
