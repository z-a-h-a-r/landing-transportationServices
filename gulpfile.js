let project_folder = require('path').basename(__dirname)
let source_folder = 'src'
let fs = require('fs')

// =================================================================
// =================================================================
let path = {
	build: {
		html: project_folder + '/',
		css: project_folder + '/css/',
		js: project_folder + '/js/',
		img: project_folder + '/img/',
		libs: project_folder + '/libs/',
		fonts: project_folder + '/fonts/',
	},

	// ----

	src: {
		html: [source_folder + '/*.html', '!' + source_folder + '/**/_*.html'],
		css: source_folder + '/scss/**/*',
		js: source_folder + '/js/**/*.js',
		img: source_folder + '/img/**/*',
		libs: source_folder + '/libs/**/*',
		fonts: source_folder + '/fonts/*.ttf',
	},

	// ----

	watch: {
		html: source_folder + '/**/*.html',
		css: source_folder + '/scss/**/*.scss',
		js: source_folder + '/js/**/*.js',
		img: source_folder + '/img/**/*.{svg, ico, png, jpg, webp, gif}',
	},

	// ----

	clean: './' + project_folder + '/',
}

// =================================================================
// =================================================================
// variables
let { src, dest } = require('gulp'),
	gulp = require('gulp'),
	browsersync = require('browser-sync').create(),
	fileinclude = require('gulp-file-include'),
	del = require('del'),
	scss = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	group_media = require('gulp-group-css-media-queries'),
	clean_css = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify-es').default,
	imagemin = require('gulp-imagemin')

// ttf2woff = require('gulp-ttf2woff'),
// ttf2woff2 = require('gulp-ttf2woff2'),
// fonter = require('gulp-fonter')

// webp = require('gulp-webp'),
// webp_html = require('gulp-webp-html'),
// webp_css = require('gulp-webpcss')

// =================================================================
// =================================================================
// Files and folders
function html() {
	return (
		src(path.src.html)
			.pipe(fileinclude())
			// .pipe(webp_html())
			.pipe(dest(path.build.html))
			.pipe(browsersync.stream())
	)
}
function css() {
	return (
		gulp
			// =================================================================
			// Creating 'style.scss'
			.src(path.src.css)
			.pipe(concat('style.scss'))

			// =================================================================
			// Formatting 'style.scss' to 'style.css'
			.pipe(
				scss({
					outputStyle: 'expanded',
				})
			)
			.pipe(group_media())
			// .pipe(webp_css())
			.pipe(
				autoprefixer({
					overrideBrowserslist: ['last 5 versions'],
					cascade: true,
				})
			)
			.pipe(gulp.dest(path.build.css))

			// =================================================================
			// Creating 'style.min.scss'
			.pipe(clean_css())
			.pipe(rename('style.min.css'))
			.pipe(dest(path.build.css))
			.pipe(browsersync.stream())
	)
}
function js() {
	return gulp
		.src(path.src.js)
		.pipe(concat('script.js'))
		.pipe(fileinclude())
		.pipe(dest(path.build.js))

		.pipe(uglify())
		.pipe(rename('script.min.js'))
		.pipe(dest(path.build.js))

		.pipe(browsersync.stream())
}
function images() {
	return (
		src(path.src.img)
			// webp
			// .pipe(
			// 	webp({
			// 		quality: 70,
			// 	})
			// )
			// .pipe(dest(path.build.img))

			// normal
			.pipe(src(path.src.img))
			.pipe(
				imagemin({
					progressive: true,
					svgoPlugins: [{ removeViewBox: false }],
					interlaced: true,
					optimizationLevel: 3,
				})
			)
			.pipe(dest(path.build.img))

			.pipe(browsersync.stream())
	)
}
function libs() {
	return src(path.src.libs).pipe(dest(path.build.libs))
}

// fonts
// function fonts() {
// 	src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts))
// 	return src(path.src.fonts).pipe(ttf2woff2()).pipe(dest(path.build.fonts))
// }
// function fontsStyle() {
// 	let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss')
// 	if (file_content == '') {
// 		fs.writeFile(source_folder + '/scss/fonts.scss', '', cb)
// 		return fs.readdir(path.build.fonts, function (err, items) {
// 			if (items) {
// 				let c_fontname
// 				for (var i = 0; i < items.length; i++) {
// 					let fontname = items[i].split('.')
// 					fontname = fontname[0]
// 					if (c_fontname != fontname) {
// 						fs.appendFile(
// 							source_folder + '/scss/fonts.scss',
// 							'@include font("' +
// 								fontname +
// 								'", "' +
// 								fontname +
// 								'", "400", "normal");\r\n',
// 							cb
// 						)
// 					}
// 					c_fontname = fontname
// 				}
// 			}
// 		})
// 	}
// }

function cb() {}
gulp.task('otf2ttf', function () {
	return src([source_folder + '/fonts/.otf']).pipe(
		fonter({
			formats: ['ttf'],
		}).pipe(dest(source_folder + '/fonts/'))
	)
})

// -----------------------------------------------------------------
// Other
function watchFiles() {
	gulp.watch([path.watch.html], html)
	gulp.watch([path.watch.css], css)
	gulp.watch([path.watch.js], js)
	gulp.watch([path.watch.img], images)
}
function clean() {
	return del(path.clean)
}
function browserSync() {
	browsersync.init({
		server: {
			baseDir: './' + project_folder + '/',
		},
		port: 3000,
		notify: false,
	})
}

// =================================================================
// =================================================================
let build = gulp.series(
	clean,
	gulp.parallel(js, css, html, images),
	libs
	// fonts,
	// fontsStyle
)
let watch = gulp.parallel(build, watchFiles, browserSync)

// =================================================================
// =================================================================
// exports
exports.build = build
exports.watch = watch
exports.default = watch

// exports.fontsStyle = fontsStyle
exports.images = images
// exports.fonts = fonts
exports.html = html
exports.libs = libs
exports.css = css
exports.js = js
