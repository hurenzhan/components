const http = require('http');
const methods = require('methods'); // 第三方模块
const fs = require('fs')
const Router = require('./router'); // 引入了路由系统

class Application {
  constructor() {
    this.router = undefined;  // 每个应用默认创建一个路由系统, 有可能人家是用应用，不用路由系统
  }

  /*1.添加中间件*/
  use(...arg) {
    this._lazyRoute();
    this.router.use(arg);
  }

  // 添加路由和通用中间件
  _lazyRoute() {
    // 如果没有路由，创建一个路由系统
    if (!this.router) {
      this.router = Router();
      // 注册一个通用中间件，添加一个专门处理返回的数据的方法
      this.use((req, res, next) => {
        res.send = function (data) {
          if (typeof data === 'object') { // 如果是个对象，直接返回JSON格式
            res.end(JSON.stringify(data));
          } else if (data === 'string' || Buffer.isBuffer(data)) {
            res.end(data);
          }
        };
        // 读文件
        res.sendFile = function (filePath) {
          fs.createReadStream(filePath).pipe(res);
        };
        next();
      })
    }
  }

  /*3.请求到来*/
  listen(...args) { // app.listen()
    const server = http.createServer((req, res) => {
      function done() {
        res.end(`Cannot ${req.method} ${req.url}`)
      }
      this._lazyRoute();
      this.router.handle(req, res, done); // 交给路由系统来处理,路由系统处理不了会调用done方法
    });
    server.listen(...args)
  }
}

/*2.注册路由*/
methods.forEach(method => {
  Application.prototype[method] = function (path, ...handlers) {
    this._lazyRoute();
    this.router[method](path, handlers);
  }
})

module.exports = Application;