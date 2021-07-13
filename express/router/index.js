const methods = require('methods');
const Layer = require('./layer');
const Route = require('./route');
const url = require("url");

/**
 * @name 路由核心
 * @description 管理路由中间件、匹配功能
 * @return {Function}
 */
function Router() { // 因为需要既能new也能执行，所以必须得是函数，使用es5构造函数方式
                    // 如果直接执行，说明是查找子路由
  const router = function (req, res, next) {
    router.handle(req, res, next);  // 通过继承得到
  };
  router.stack = [];
  router.events = {};
  router.__proto__ = proto;
  return router
}

const proto = {};

proto.route = function (path) {
  const route = new Route;
  const layer = new Layer(path, route.dispatch.bind(route));  // this指向实例本身，不然执行this可能有问题
  layer.route = route;
  this.stack.push(layer);
  return route;
};

// 配置请求类型
methods.forEach(method => {
  proto[method] = function (path, ...handlers) { // 向路由的stack中添加
    const route = this.route(path); // 每次配置一个新路由，并且配置到新的layer上加入队列
    route[method](handlers);  // 给路由添加方法
  };
})

// 注册路由
proto.use = function (path, ...arg) { // '/xx', fn
  let handlers = [];  // 一个路由可能传多个方法，存起来
  if (typeof path === 'function') { // 如果没传路径，说明任何情况都要使用，默认为根路径
    path = '/';
    handlers = [path, ...arg];
  } else {
    handlers = arg;
  }
  handlers.forEach(handler => {
    // 如果layer上有route属性 说明是路由，没有说明是中间件
    const layer = new Layer(path, handler);
    this.stack.push(layer);
  })
};

// 查找子路由执行
proto.handle = function (req, res, done) {
  const {pathname} = url.parse(req.url);
  const method = req.method.toLowerCase();
  let i = 0;
  const next = err => {
    if (i === this.stack.length) return done();
  }
};

// Router().handle({url: 'www.baidu.com/a?a=1&b=2'})

module.exports = Router;