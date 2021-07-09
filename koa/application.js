const EventEmitter = require('events');
const http = require('http');
const context = require('./context');
const request = require('./request');
const response = require('./response');
const Stream = require('stream');

/**
 * @name koa
 * @description koa源码思路
 * @return {Class}
 */
class Koa extends EventEmitter {
  constructor() {
    super();
    // 保证应用之间互不干扰，多个实例共享一个上下文会混乱
    this.context = Object.create(context); // this.context.__proto__ = context
    this.request = Object.create(request);
    this.response = Object.create(response);
    this.middlewares = [] // 执行队列
  }

  // 添加队列
  use(middleware) {
    this.middlewares.push(middleware)
  }

  // 设置上下文
  createContext(req, res) {
    // 多次请求共享了同一个上下文，继续隔离
    const ctx = Object.create(this.context); // ctx.__proto__.__proto__ = context
    const request = Object.create(this.request);
    const response = Object.create(this.response);

    ctx.request = request;  // request.xxx 都是封装的
    ctx.req = ctx.request.req = req;  // req.xxx 就是原生的
    ctx.response = response;
    ctx.res = ctx.response.res = res;

    return ctx;
  }

  // 顺序调用列队，把度列中的方法传当做next给用户调用
  compose(ctx) {
    // let index = -1; // 计数，如果一个方法重复调用，返回异常
    const dispatch = i => {
      return Promise.resolve( // 里面的方法可能用promise，所以包裹一下
          this.middlewares[i](
              ctx, () => dispatch(i + 1)
          )
      )
    }
    return dispatch(0);
  }

  // 处理上下文
  handleRequest(req, res) {
    const ctx = this.createContext(req, res); // 1.设置上下文
    res.statusCode = 404; // 先设置404，如果设置了body再改成200
    this.compose(ctx).then(() => {

    })
  }

  // 开启监听

  listen(...args) {
    const server = http.createServer(this.handleRequest);
    server.listen(...args);
  }
}