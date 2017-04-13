/**
 * 小程序配置文件
 */

// 服务器域名
var host = 'wss.yicodes.com';

//本地调试
//var host = 'localhost';

var config = {

    // 下面的地址配合云端
    service: {
        host,
        // 登录地址，用于建立会话
        wssUrl: `wss://${host}`,

    }
};

module.exports = config;