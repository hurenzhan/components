const Application = require('./application')
const Router = require('./Router');

/**
 * @name 主入口
 * @description 管理路由中间件、匹配功能
 * @return {Function}
 */
function createApplication() {
  return new Application();
}

// 添加可执路由组件，用做子路由拆分
createApplication.Router = Router;

module.exports = createApplication