const EventEmitter = require('events');
const fs = require('fs');

/**
 * @name 读取流
 * @description 可以将文件一点点读取
 * @param {path} path // 要读的文件路径
 * @param {Object} options  // 操作配置
 * @return {Class}
 */
class ReadStream extends EventEmitter { // 继承EventEmitter，需要用到它的on、emit等方法
  constructor(path, options = {}) {
    super();
    const {flags, encoding, autoClose, emitClose, start, end, highWaterMark} = options;
    this.path = path;
    this.flags = flags || 'r'; // r：打开文件进行读取。如果文件不存在，则会发生异常
    this.encoding = encoding || null; // 编码规则
    this.autoClose = autoClose || true; // 自动关闭，无论成功失败
    this.emitClose = emitClose || true; // 始终触发close事件
    this.start = start || 0; // 起始位置
    this.end = end; // 结束位置
    this.highWaterMark = highWaterMark || 64 * 1024;  // 一次读的总量
    this.flowing = false; // 流动状态，默认还没开始读文件内容，后续由pause resume控制这个状态
    this.fd = null; // 文件描述
    this.open(); /*1.默认先执行打开*/
    // 在EventEmitter里，每次调用on方法，只要不是newListener时间，都会同步触发newListener的回调
    this.on('newListener', type => {
      if (type === 'data') {
        this.flowing = true;
        this.read();
      }
      this.offset = this.start; // 初始化偏移量
    });
  }

  open() {

  }

  read() {

  }
}


module.exports = ReadStream;