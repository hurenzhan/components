const EventEmitter = require('./events');

console.log(EventEmitter, 'EventEmitter');

function test1(val) {
  console.log(val, 'test1');
}

function test2(val) {
  console.log(val, 'test2');
}

const events = new EventEmitter();
events.on('test', test1)
events.on('test', test2)
events.off('test', test2)
events.emit('test', '666')