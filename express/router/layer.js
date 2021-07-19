const {match} = require("path-to-regexp");

/**
 * @name 执行层
 * @description
 * 1.没路由，handler就是具体存放方法的地方。
 * 2.有路由，handler就是路由的dispatch方法，做队列顺序调用。
 * @return {Class}
 */
class Layer {
  constructor(path, handler) {
    this.path = path; // 定义路径
    // this.path = path; // 定义路径
    this.handler = handler;
    this.params = undefined;  // 动态路由参数
    this.method = undefined;  // 方法的类型
    this.route = undefined;  // 路由，存执行队列
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

    // 没有理由代表是中间件
    if (!this.route) {
      if (this.path) return true; // 注册中间件没有path默认path会处理成/且
      return pathname.startsWith(this.path + '/');  // 如果匹配到中间件路径前缀，也执行
    }

    return false;
  }

  //
}

module.exports = Layer;