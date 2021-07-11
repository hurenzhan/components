const Koa = require('./application');
const Router = require('./router');
const fs = require('fs')
const app = new Koa();
const sleep = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('sleep')
      resolve();
    }, time);
  })
}

// app.use(async (ctx, next) => {
//   ctx.body =  fs.createReadStream(require('path').resolve(__dirname,'../README.md'))
//   await next()
//   // await next()
// })
// app.use(async (ctx, next) => {
//   ctx.body = 'three'
//   await sleep(1000);
//   next();
//   ctx.body = 'four'
// })
// app.use(async (ctx, next) => {
//   ctx.body = 'five'
//   next();
//   ctx.body = 'sex'
// })

const router = new Router();

router.get('/test', async (ctx, next) => {
  ctx.body = 'test';
  next();
})

router.get('/test', async (ctx, next) => {
  ctx.body = 'test1';
  next();
})

app.use(router.routers());
app.use((ctx, next) => {
  console.log(123)
})

app.listen(3000);

app.on('error', function (err) {
  console.log(err)
})
