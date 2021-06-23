let base64Map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
base64Map += base64Map.toLowerCase() + '0123456789+/';
const base32Map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

// 编码集
const codeMap = {
  64: base64Map,
  32: base32Map
}

// 策略模式，根据转化类型，选择处理策略
const handleStrategy = {
  // base64 需要把2进制转化为4个字节，空余前面补0
  [base64Map]: (binaryList) => {
    const COLLECT_NUM = 4;  // 拆分数
    const COLLECT_SIZE = 8; // 每份长度
    const binarycollect = binaryList.join(''); // 获取二进制集合
    const partLength = binarycollect.length / COLLECT_NUM;  // 每等分需要切割的个数
    let code = '';
    // 将2进制分成4个字节即4等分
    for (let index = 0; index < COLLECT_NUM; index++) {
      let foramtBinary = binarycollect.slice(index * partLength, (index + 1) * partLength) // 当做分页处理，一共4页
      foramtBinary = foramtBinary.padStart(COLLECT_SIZE, '0') // 给每块不足8位的前面补0生成新的二进制
      const formatValue = parseInt(foramtBinary, 2) // 将二进制转化成对应的数值
      code += base64Map[formatValue]; // 根据base64映射表取值
    }
    return code
  },
  // base32 需要把2进制转化为5个字节，空余前面补0
  [base32Map]: (binaryList) => {
    const COLLECT_NUM = 5;  // 拆分数
    const COLLECT_SIZE = 5; // 每份长度
    const binarycollect = binaryList.join(''); // 获取二进制集合
    const partLength = Math.ceil(binarycollect.length / COLLECT_NUM);  // 每等分需要切割的个数
    let code = '';
    // 将2进制分成4个字节即4等分
    for (let index = 0; index < COLLECT_NUM; index++) {
      let foramtBinary = binarycollect.slice(index * partLength, (index + 1) * partLength) // 当做分页处理，一共5页
      foramtBinary = foramtBinary.padEnd(COLLECT_SIZE, '0') // 给每块不足5位后面补0
      const formatValue = parseInt(foramtBinary, 2) // 将二进制转化成对应的数值
      code += base32Map[formatValue]; // 根据base32映射表取值
    }
    return code + '==='
  }
}

// 使用Array.from解析buffer会直接得到16进制列表，然后再转化为二进制
const getBinaryList = str => Array.from(Buffer.from(str)).map(bs => bs.toString(2));

/**
 *
 * @description 字符串转base64/32编码
 * @param {String} type 转化的类型
 * @param {String} str  转化字符串
 */
function stringToBaseCode(type, str) {
  const map = codeMap[type]; // 获取对应的编码集
  if (!map) return null;
  const strList = str.split('');
  let codeCollect;
  // 遍历所有字段的base64编码
  strList.forEach((s, index) => { // 1.遍历字符串，依次处理
    // 使用Array.from解析buffer会直接得到16进制列表，然后再转化为二进制
    const strBinaryList = getBinaryList(s);
    const value = handleStrategy[map](strBinaryList); // 2.根据策略获得对应的编码
    if (map === base64Map) codeCollect ? codeCollect += value : codeCollect = value
    if (map === base32Map) codeCollect ? codeCollect.push(value) : codeCollect = [value]
  })
  return codeCollect;
}

module.exports = stringToBaseCode;