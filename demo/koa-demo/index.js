const Koa = require('koa')
const Router = require('koa-router')
const { koaBody } = require('koa-body')
const cors = require('@koa/cors')
const json = require('koa-json')

const app = new Koa()
const router = new Router()
// const bodyParser = new body()

router.prefix('/api') // 定义路由前缀

router.get('/', async ctx=>{ // 定义路由
    console.log(ctx)
    // console.log(ctx.request)
    ctx.body = 'hello koa!'
})

router.get('/api', async ctx=>{ // 定义路由
    //get params
    const params = ctx.request.query
    console.log(params)
    ctx.body = {
        ...params,
        message: 'hello api!'
    }
})

router.post('/post', async ctx=>{
    const { body } = ctx.request // 解析请求体，拿到客户端提交的数据
    console.log(body) 
    console.log(ctx.request)
    ctx.body = { // 响应体设置，把处理结果作为响应返回
        ...body,
        message: 'hello post!'
    }
}) 


// app.use 会按照注册的顺序依次执行
app.use(koaBody())// 解析请求体
app.use(cors())// 处理跨域请求
app.use(json({pretty: false, param: 'pretty'}))// 处理JSON响应，pretty: false 不格式化JSON，param: 'pretty' 参数名
app.use(router.routes()) 
    .use(router.allowedMethods()) // 使用路由允许的方法

app.listen(3000)