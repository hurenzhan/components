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
  router.stack = [];  // 执行列表
  router.events = {};
  router.__proto__ = proto;
  return router
}

const proto = {};

/*1.注册路由（中间件）*/
proto.use = function (path, ...args) { // '/xx', fn
  let handlers = [];  // 一个路由可能传多个方法，存起来
  if (typeof path === 'function') { // 如果没传路径，说明任何情况都要使用，默认为根路径
    path = '/';
    handlers = [...args];
  } else {
    handlers = args;
  }
  handlers.forEach(handler => {
    // 如果layer上有route属性 说明是路由，没有说明是中间件
    const layer = new Layer(path, handler);
    this.stack.push(layer);
  })
};

/*2.注册路由（配置请求类型）*/
methods.forEach(method => {
  proto[method] = function (path, handlers) { // 向路由的stack中添加
    const route = this.route(path); // 每次配置一个新路由，并且配置到新的layer上加入队列
    route[method](handlers);  // 给路由添加方法
  };
})

/*3.执行栈队列*/
proto.handle = function (req, res, done) {
  const {pathname} = url.parse(req.url);
  const method = req.method.toLowerCase();
  let i = 0;
  let removed = ''
  const next = err => {
    if (i === this.stack.length) return done(); // 说明匹配不到可调用的，或者调用完最后一个方法没做end处理的
    const layer = this.stack[i++];

    if (removed.length) {
      req.url = removed + req.url;
      removed = ''; // 从next方法出来的时候 需要增添前缀
    }

    if (err) {
      // 如果有错误就在栈中查找错误处理中间件，不是错误处理中间件的就不要执行了
      if (!layer.route) {
        if (layer.handler.length === 4) return layer.handler(err, req, res, next);  // router dispatch
        return next(err);
      }
      next(err);
    } else {
      if (layer.match(pathname)) {
        req.params = layer.params;  // 如果是动态路由，把参数赋值
        if (!layer.router) {  // 没路由说明是中间件
          if (layer.handler.length === 4) return next();  // 如果正常情况下，是不执行错误处理中间件的
          if (layer.path !== '/') { // 如果中间件带路径，要剔除前缀，因为可能是二级路由，需要用二级路由的路径去匹配
            removed = layer.path;
            req.url = req.url.slice(removed.length);  // 截取二级路由匹配路径
          }
          return layer.handle_request(req, res, next);
        }

        // 先匹配方法再执行，不然同一个路径可能多个不同类型的请求
        if (layer.route.methods[method]) {
          return layer.handle_request(req, res, next);
        }

        return next();
      }
      next(); // 匹配不到直接走下一个
    }
  };
  next();
};

proto.route = function (path) {
  let route = new Route();
  let layer = new Layer(path, route.dispatch.bind(route));
  layer.route = route;
  this.stack.push(layer);
  return route;
}


module.exports = Router;