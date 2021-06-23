const stringToBaseCode = require('../stringToBaseCode');
const curring = require('../curring');

const curringBase32Fn = curring(stringToBaseCode)(32);
const str1 = curringBase32Fn('纳垢')
const str2 = curringBase32Fn('色孽')

const curringBase64Fn = curring(stringToBaseCode)(64);
const str3 = curringBase64Fn('恐虐')
const str4 = curringBase64Fn('奸奇')

console.log(str1, 'base32');
console.log(str2, 'base32');
console.log(str3, 'base64');
console.log(str4, 'base64'); 