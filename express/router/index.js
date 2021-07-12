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
}

const proto = {};

// 注册路由
proto.use = function (path) {
  const args = Array.from(arguments); // '/xx', fn
  let handlers = [];  // 一个路由可能传多个方法，存起来
  if (typeof path === 'function') { // 如果没传路径，说明任何情况都要使用，默认为根路径
    path = '/';
    handlers = [...args];
  }
  console.log(handlers);
};

// 查找子路由执行
proto.handle = function (req, res, done) {

};

module.exports = Router;