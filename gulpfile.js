var gulp = require('gulp'),
	gutil = require('gulp-util'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	cleanCSS = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	del = require('del'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	cache = require('gulp-cache'),
	autoprefixer = require('gulp-autoprefixer'),
	fileinclude = require('gulp-file-include'),
	gulpRemoveHtml = require('gulp-remove-html'),
	bourbon = require('node-bourbon'),
	ftp = require('vinyl-ftp');

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'dist/'
		},
		notify: false
	});
});

gulp.task('sass', ['headersass'], function() {
	return gulp.src('src/sass/**/*.scss')
		.pipe(sass({
			includePaths: bourbon.includePaths
		}).on('error', sass.logError))
		.pipe(rename({
			suffix: '.min',
			prefix: ''
		}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

gulp.task('headersass', function() {

	return gulp.src('src/header.scss')
		.pipe(sass({
			includePaths: bourbon.includePaths
		}).on('error', sass.logError))
		.pipe(rename({
			suffix: '.min',
			prefix: ''
		}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest('dist/'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

gulp.task('libs', function() {
	return gulp.src([
			'src/libs/bower_components/jquery/dist/jquery.min.js',
			'src/libs/bower_components/bxslider/jquery.bxSlider.min.js',
			'src/libs/bower_components/fancybox/source/jquery.fancybox.pack.js'
			// 'src/libs/magnific-popup/magnific-popup.min.js'
		])
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('src/js'))
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('watch', ['buildhtml', 'sass', 'libs', 'browser-sync'], function() {
	gulp.watch('src/header.scss', ['headersass']);
	gulp.watch('src/sass/**/*.scss', ['sass']);
	gulp.watch('src/**/*.html', ['buildhtml'], browserSync.reload);
	gulp.watch('src/js/**/*.js', browserSync.reload);
});

gulp.task('imagemin', function() {
	return gulp.src('src/img/**/*')
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{
				removeViewBox: false
			}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img'));
});

gulp.task('buildhtml', function() {
	gulp.src(['src/*.html'])
		.pipe(fileinclude({
			prefix: '@@'
		}))
		.pipe(gulpRemoveHtml())
		//.pipe(gulp.dest('src/'))
		.pipe(gulp.dest('dist/'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('removedist', function() {
	return del.sync('dist');
});

gulp.task('build', ['removedist', 'buildhtml', 'imagemin', 'sass', 'libs'], function() {

	var buildCss = gulp.src([
		'src/css/fonts.min.css',
		'src/css/main.min.css'
	]).pipe(gulp.dest('dist/css'));

	var buildFiles = gulp.src([
		'src/.htaccess',
		'src/header.min.css'
	]).pipe(gulp.dest('dist'));

	var buildFonts = gulp.src('src/fonts/**/*').pipe(gulp.dest('dist/fonts'));

	var buildJs = gulp.src('src/js/*.js')
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));


});

gulp.task('deploy', function() {

	var conn = ftp.create({
		host: 'hostname.com',
		user: 'username',
		password: 'userpassword',
		parallel: 10,
		log: gutil.log
	});

	var globs = [
		'dist/**',
		'dist/.htaccess',
	];
	return gulp.src(globs, {
			buffer: false
		})
		.pipe(conn.dest('/path/to/folder/on/server'));

});

gulp.task('clearcache', function() {
	return cache.clearAll();
});

gulp.task('default', ['watch']);
