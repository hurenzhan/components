/**
 * @name 路由
 * @description 路由中间件配置
 * @return {Class}
 */
class Layer {
  constructor(path, method, callback) {
    this.path = path;
    this.method = method;
    this.callback = callback; // next
  }

  // 匹配用户访问路由是否存在
  match(path, method) {
    return this.path === path && this.method === method.toLowerCase();
  }
}

/**
 * @name 路由中心
 * @description 路由派发组件
 * @return {Class}
 */
class Router {
  constructor() {
    this.stack = [];  // 匹配的路由队列
  }

  routers() {
    return async (ctx, next) => { // next 是当前中间件的下一个中间件
      console.log(ctx.method, 'ctx.method')
      const path = ctx.path;
      const method = ctx.method;
      const layers = this.stack.filter(layer => layer.match(path, method)); // 匹配要执行的路由
      this.compose(layers, ctx, next);
    }
  }

  // 一次调用路由中间件方法
  compose(layers, ctx, next) {
    const layersLength = layers.length;
    const dispatch = i => {
      if (i === layersLength) return next();  // 如果执行完，直接执行下个中间件
      const callback = layers[i].callback;  // 路由处理方法，执行完直接调用下一个
      return Promise.resolve(
          callback(ctx, () => dispatch(i + 1))
      );
    };
    dispatch(0)
  }
}

['get', 'post'].forEach(method => {
  Router.prototype[method] = function (path, callback) {
    const layer = new Layer(path, method, callback);
    this.stack.push(layer);
  };
});

module.exports = Router;