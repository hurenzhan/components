/**
 * @description 订阅的事件中心
 */
class EventEmitter {
  constructor() {
    this._events = {};  // 事件仓库
  }

  // 订阅事件
  on(eventName, callback) {
    if (!this._events) this._events = {} // 对方调用的时候可能会改变this指向，所以默认给对方的this添加一个仓库
    const callbacks = this._events[eventName] || [];
    callbacks.push(callback);  // 获取订阅的事件名的事件列表，如果没有添加默认列表
    this._events[eventName] = callbacks;
  }

  // 发布事件
  emit(eventName, ...args) {
    if (!this._events) this._events = {}
    const callbacks = this._events[eventName];
    if (callbacks) callbacks.forEach(fn => {  // 循环发布事件
      fn(...args);
    });
  }

  off(eventName, callback) {
    if (!this._events) this._events = {};
    const callbacks = this._events[eventName];
    if (callbacks.length) {
      this._events[eventName] = callbacks.filter(fn => ![fn, fn.origin].includes(callback)) // 过滤掉要取消订阅的函数
    }
  }

  once(eventName, callback) {
    const oneFn = (...args) => {
      callback(...args);
      this.off(eventName, oneFn)
    }
    oneFn.origin = callback;  // 如果绑定once马上又off掉事件，传入的fn和高阶函数并不是一个对象，所有给内部函数添加一个关联属性。
    this.on(eventName, oneFn);
  }
}

module.exports = EventEmitter;