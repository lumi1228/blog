const Koa = require('koa')
const app = new Koa()

const middleware = async (ctx, next) => {
    console.log('this is middleware')
    next() // 调用下一个中间件
    console.log('this is middleware after next')
}
const middleware1 = async (ctx, next) => {
    console.log('this is middleware1')
    next()
    console.log('this is middleware1 after next')
}

const middleware2 = async (ctx, next) => {
    console.log('this is middleware2')
    next()
    console.log('this is middleware2 after next')
}


app.use(middleware)
app.use(middleware1)
app.use(middleware2)

app.listen(3000)

