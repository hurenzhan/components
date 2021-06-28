const ReadStream = require('./ReadStream')
const path = require("path");

const rs = new ReadStream(path.resolve(__dirname, 'text1.txt'), {highWaterMark: 1});

rs.on('open', () => {
  console.log('open')
});

rs.on('data', (bf) => {
  console.log(bf, 'bf');
  rs.pause();
});

rs.on('end', () => {
  console.log('end');
});

const timer = setInterval(() => {
  rs.resume();
}, 1000)

rs.on('close', () => {
  console.log('close');
  clearInterval(timer);
});