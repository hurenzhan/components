// 用户可能会多次设置，以最后一个为准

const response = {
  _body:undefined,
  res: undefined,

  get body(){
    return this._body;
  },
  set body(value){
    // 用户设置（调用）ctx.body 的时候 会更改状态码
    this.res.statusCode = 200;
    this._body = value;
  }
}

module.exports = response;