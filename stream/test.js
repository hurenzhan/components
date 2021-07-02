const ReadStream = require('./ReadStream')
const WriteStream = require('./writeStream')
const path = require("path");

const rs = new ReadStream(path.resolve(__dirname,'text1.txt'));
const ws = new WriteStream(path.resolve(__dirname, 'text2.txt'), {highWaterMark: 1});

rs.pipe(ws);