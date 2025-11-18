const { src, dest,series, watch ,parallel} = require('gulp')
const plugins = require('gulp-load-plugins')()
// 说明：del插件无gulp-开头，无法通过plugins插件直接使用，需要单独引入
const del = (...args) => import('del').then(m => m.deleteAsync(...args))

const sass = require('gulp-sass')(require('sass'));
const autoprefixer = () => import('gulp-autoprefixer').then(m => m.default)

// const browserSync = require('browser-sync')
const browserSync = require('browser-sync').create()
const reload = browserSync.reload


function js (cb) {
    src('*.js') // 源文件
    	.pipe(plugins.uglify()) // 压缩
    	.pipe(dest('./dist/js')) // 输出
        .on('end', () => browserSync.reload())
        console.log('this is js scripts task')
    cb() // 回调函数
}


// 对scss文件编译，压缩，输出css文件
async function css (cb) {
    const autoprefixerPlugin = await autoprefixer()
    return src('*.scss')
    	.pipe(sass({ outputStyle: 'compressed' }))
        .pipe(autoprefixerPlugin({ cascade: false, remove: false })) 
    	.pipe(dest('./dist/css')) // 输出css文件
        .pipe(browserSync.stream())   
    cb()
}

// 监听这些文件的变化
// 监听这些文件的变化
function watcher () {
    watch('*.js', js)
    watch('*.scss', css)
    watch('*.html').on('change', browserSync.reload)
}


async function clean () {
    await del('./dist')
}
// server任务
function serve (cb) {
    browserSync.init({
        server: {
            baseDir: './'
        }
    })
    cb()
}

  
exports.scripts = js
exports.styles = css
exports.clean = clean
exports.default = series(
    clean,
    parallel(js, css),
    watcher,
    serve
)
