const EventEmitter = require('events');
const fs = require('fs');

/**
 * @name 可读流
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
    this._open(); /*1.默认先执行打开*/
    // 在EventEmitter里，每次调用on方法，只要不是newListener时间，都会同步触发newListener的回调
    this.on('newListener', type => {
      if (type === 'data') {
        this.flowing = true;
        this._read();  /*2.打开完之后开始读文件*/
      }
      this.offset = this.start; // 初始化偏移量
    });
  }

  // 结束操作
  _destroy(err) {
    if (err) return this.emit('error', err);
    // 如果有autoClose，执行关闭操作
    // 如果有emitClose，触发关闭事件
    if (this.autoClose) {
      fs.close(this.fd, () => {
        if (this.emitClose) this.emit('close');
      })
    }
  }

  // 打开
  _open() {
    fs.open(this.path, this.flags, (err, fd) => {
      if (err) return this._destroy(err);
      this.fd = fd;
      this.emit('open', fd);
    })
  }

  // 读取
  _read() {
    // 如果还没打开文件，是获取不到fd的，然后监听一次打开事件再执行read方法
    if (typeof this.fd !== 'number') return this.once('open', () => this._read());
    // 根据的 start 和 end 范围进行读取
    // 一次读默认字节数，剩余量 = 总字节 - 每次的偏移量，剩余量小于默认字节，取剩余量，节省多余操作
    const readVolume = this.end ? Math.min(this.highWaterMark, this.end - this.offset + 1) : this.highWaterMark;
    const buffer = Buffer.alloc(readVolume); // 创建一个buffer容器
    // 参数：要读取的文件描述 写入的buffer 写去buffer的起始位置 读取量 读取其实位置
    fs.read(this.fd, buffer, 0, readVolume, this.offset, (err, bytesRead) => {
      if (bytesRead) {
        this.offset += bytesRead; // 偏移量 = 读取量 + 自身
        this.emit('data', buffer.slice(0, bytesRead));  // 返回读取的数据
        if (this.flowing) this._read();  // 流动状态不变就继续读
      } else {
        // 代表读完了
        this.emit('end');
        this._destroy();
      }
    })
  }

  // 继续
  resume() {
    if (!this.flowing) {
      this.flowing = true;
      this._read();
    }
  }

  // 暂停
  pause() {
    this.flowing = false;
  }

  // 管道，可读一点写一点
  pipe(ws) {
    this.on('data', chunk => { // 直接读取
      const flag = ws.write(chunk);
      if (!flag) this.pause();  // 如果没写完，先暂停读取
    })

    ws.on('drain', () => {
      this.resume();  // 写完后继续读取
    })
  }
}

module.exports = ReadStream;