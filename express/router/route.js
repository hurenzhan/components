const methods = require('methods')
const Layer = require('./layer');

/**
 * @name 路由
 * @description 存放执行层方法列表，用来依次调用方法用
 * @return {Class}
 */
class Route {
  constructor() {
    this.stack = [];  // layer栈，存放方法
    this.methods = {};  // 用来标识route上包含哪些方法
  }

  // 派发依次执行队列
  dispatch(req, res, out) {
    let i = 0;
    let next = err => {
      if (err) return out(err);  // 内部路由抛出错误 我就将错误派发到外层处理
      if (i === this.stack.length) return out();  // 说明执行完了
      const layer = this.stack[i++];
      console.log(layer.handler, 'layer');
      if (layer.method === req.method.toLowerCase()) {
        layer.handler(req, res, next)
      } else {
        next();
      }
    };
    next();
  }
}

methods.forEach(method => {
  Route.prototype[method] = function (handlers) {
    handlers.forEach(handler => {
      const layer = new Layer('/', handler);  // 最底层，没有路径，随便给个默认的
      layer.method = method;  // 给每一层都添加一个方法
      this.methods[method] = true;
      this.stack.push(layer);
    });
  };
});

module.exports = Route;