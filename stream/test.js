const ReadStream = require('./ReadStream')
const path = require("path");

const rs = new ReadStream(path.resolve(__dirname, 'text1.txt'))

rs.on('dasd', () => {

});

rs.on('dasd32132', () => {

});