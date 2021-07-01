const EventEmitter = require('events');
const fs = require('fs')
const path = require("path");
const {Queue} = require('../LinkList')

/**
 * @name 可写流
 * @description 可以将文件一点点读取
 * @param {path} path // 要读的文件路径
 * @param {Object} options  // 操作配置
 * @return {Class}
 */
class WriteStream extends EventEmitter {
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
    this.highWaterMark = highWaterMark || 64 * 1024;  // 一轮写的总量
    // 自定义写入流的属性
    this.fd = null; // 文件描述
    this.length = 0; // 记录已写入的长度，用来跟highWaterMark对比是否完成了一轮写入
    this.offset = this.start; // 写入的偏移量
    this.cache = new Queue; // 用队列做缓存区
    this.needDrain = false; // 是否完成一轮预值写入，每论写入量达 highWaterMark，改变此状态并触发 drain 事件
    this.writing = false; // 表示是否正在写入，剩余的先放缓存区
    // 先打开文件
    this._open();
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

  // 获取并清除准备要写的数据
  clearBuffer() {
    const data = this.cache.peak(); // 获取并在缓存区清掉要写入的数据
    // 如果有继续写入，否则改变写入状态结束操作
    if (data) {
      const {chunk, encoding, cb} = data.element;
      this._write(chunk, encoding, cb);
    } else {
      this.writing = false;
      this._destroy();
      // 如果结束并且写入量达到预值，触发drain事件
      if (this.needDrain) {
        this.needDrain = false;
        this.emit('drain')
      }
    }
  }

  // 写入操作
  write(chunk, encoding = null, cb) {
    chunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);  // 如果写入的不是buffer类型，要先转化
    this.length += chunk.length;
    this.needDrain = this.length >= this.highWaterMark;
    // 每次写完触发回调的同时要从缓存区拿到数据并清除它，重新包装一个函数执行
    const oldCb = cb;
    cb = () => {
      oldCb && oldCb();
      this.clearBuffer()
    }
    // 如果还在写入，把剩余数据先放入缓存区，否则执行写入操作
    if (this.writing) {
      this.cache.add({chunk, encoding, cb})
    } else {
      this.writing = true;
      this._write(chunk, encoding, cb)
    }
    return !this.needDrain; // 每次执行先返回传入的数据是否达到一轮的峰值
  }

  _write(chunk, encoding, cb) {
    // 如果还没打开说没没fd，先等打开完成再写入
    if (typeof this.fd !== 'number') return this.once('open', () => this._write(chunk, encoding, cb));
    // 参数：要写入的文件描述 写入的buffer 写去buffer的起始位置 写入量 写入其实位置
    fs.write(this.fd, chunk, 0, chunk.length, this.offset, (err, bytesWrite) => {
      this.offset += bytesWrite;
      this.length -= bytesWrite;
      // console.log(bytesWrite, 'bytesWrite');
      cb(); // 继续写入并清空缓存
    })
  }
}

const ws = new WriteStream(path.resolve(__dirname, 'text1.txt'), {
  flags: 'w',
  encoding: null,
  mode: 0o666,
  autoClose: true,
  emitClose: true,
  start: 0,
  highWaterMark: 3 // 水位线 我预期能放到多少  我预期用多少空间来做这件事，超过预期 依然可用
})


let index = 0;

function write() {
  let flag = true
  while (index !== 10 && flag) {
    flag = ws.write(index + '')
  }
}

write();
ws.on('drain', function () { // 此方法 需要保证当写入的数据达到预期后，并且数据全部被清空写入到文件中，才会触发
  write()
  console.log('drain')
})

ws.on('open',function () { // 此方法 需要保证当写入的数据达到预期后，并且数据全部被清空写入到文件中，才会触发
  console.log('open')
})