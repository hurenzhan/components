const {match} = require("path-to-regexp");

/**
 * @name 执行层
 * @description 路径具体存放方法的地方，下面可能还有路由
 * @return {Class}
 */
class Layer {
  constructor(path, handler) {
    this.path = 'xx.com/:a/:b'; // 定义路径
    // this.path = path; // 定义路径
    this.handler = handler;
    this.params = undefined;  // 动态路由参数
    this.method = undefined;  // 方法的类型
    this.route = undefined;  // 子路由
  }

  // 匹配路径
  match(pathname) { // 用户实际访问路径
    // 无论中间件layer 还是路由layer  只要一样肯定匹配到
    if (this.path === pathname) return true;

    // 不相等可能是动态路由
    if (this.path !== pathname) {
      const mHandle = match(this.path, {decode: decodeURIComponent});
      const info = mHandle(pathname); // 匹配成功会解析参数
      if (info) {
        this.params = info.params;
        return true;
      }
    }
  }
}

module.exports = Layer;