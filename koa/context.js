// 封装的上下文

const curring = require("../curring");

const context = {}

// 做代理，解决过长的调用链
function curringDefine(action, target, key) {
  const actions = {
    'get': defineGetter,
    'set': defineSetter,
  }
  actions[action](target, key);
}

function defineGetter(target, key) {
  // Object.defineProperty(context, key, {
  //   get() {
  //     return this[target][key];
  //   }
  // })
  context.__defineGetter__(key, function () {
    return this[target][key]
  })
}

function defineSetter(target, key) {
  // Object.defineProperty(context, key, {
  //   set(value) {
  //     this[target][key] = value;
  //   }
  // })
  context.__defineSetter__(key, function (val) {
    this[target][key] = val;
  })
}

// 柯里化
const define = curring(curringDefine);
const defineGetRequest = define('get', 'request');
const defineGetResponse = define('get', 'response');
const defineSetResponse = define('set', 'response');

defineGetRequest('query');
defineGetRequest('path');
defineGetRequest('method');

defineGetResponse('body');

defineSetResponse('body');

module.exports = context;