const Koa = require('./application');
const fs =require('fs')
const app = new Koa();
const sleep = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('sleep')
      resolve();
    }, time);
  })
}

app.use(async (ctx, next) => {
  ctx.body =  fs.createReadStream(require('path').resolve(__dirname,'../README.md'))
  await next()
  // await next()
})
app.use(async (ctx, next) => {
  ctx.body = 'three'
  await sleep(1000);
  next();
  ctx.body = 'four'
})
app.use(async (ctx, next) => {
  ctx.body = 'five'
  next();
  ctx.body = 'sex'
})

app.listen(3000);

app.on('error',function(err){
  console.log(err)
})
