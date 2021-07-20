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

/*1.注册路由（中间件）*/
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

/*2.注册路由（配置请求类型）*/
methods.forEach(method => {
  proto[method] = function (path, ...handlers) { // 向路由的stack中添加
    const route = this.route(path); // 每次配置一个新路由，并且配置到新的layer上加入队列
    route[method](handlers);  // 给路由添加方法
  };
})

function handleNext(layer, req, res, next) {
  const { pathname } = url.parse(req.url);
  const isMatch = layer.match(pathname);
  req.params = layer.params
  const matchMap = {

  }
}

/*3.执行栈队列*/
proto.handle = function (req, res, done) {
  const {pathname} = url.parse(req.url);
  const method = req.method.toLowerCase();
  let i = 0;
  const next = err => {
    if (i === this.stack.length) return done(); // 说明匹配不到可调用的，或者调用完最后一个方法没做end处理的
    const layer = this.stack[i++];
    if (err) {

    } else {
      // 匹配队列中的路径
      if (layer.match(pathname)) {
        req.params = layer.params;  // 赋值动态路由参数
      }
    }
  };
  next();
};

proto.route = function (path) {
  const route = new Route;
  // 它的handler其实是路由执行栈，调用它下面的方法
  const layer = new Layer(path, route.dispatch.bind(route));  // this指向实例本身，不然执行this可能有问题
  layer.route = route;
  this.stack.push(layer);
  return route;
};

// Router().handle({url: 'www.baidu.com/a?a=1&b=2'})

module.exports = Router;