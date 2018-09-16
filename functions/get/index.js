// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
var request = require('request');

// 云函数入口函数
exports.main = async(event, context) => {
  request('https://www.baidu.com', function(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body) // 请求成功的处理逻辑
    }
    console.log(123)
  });
  console.log(456)
}