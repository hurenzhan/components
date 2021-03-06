// 通过代理做一些属性值转化

const url = require('url');

const request = {
  req: undefined,

  get url() { // Object.defineProperty 属性访问器
    return this.req.url
  },
  get method() {
    return this.req.method
  },
  get path() {
    return url.parse(this.url).pathname;
  },
  get query() {
    return url.parse(this.req.url, true).query;
  }
}

module.exports = request;