/**
 * @name 函数柯里化
 * @description 根据参数的个数 转化成n个函数
 * @param {Function} fn
 * @return {Function} 
 */
function curring(fn) {
  const inner = (args = []) => {  // 第一次执行初始化参数存储
    return args.length >= fn.length ?
      fn(...args) : // 参数长度等于目标函数参数长度，直接执行函数
      (...arr) => inner([...args, ...arr])  // 每传一次参数就存储一次
  }
  return inner();
}

module.exports = curring;