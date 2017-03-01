//issues.js
//获取应用实例
var app = getApp();
Page({
  data: {
    list_remind: '加载中',
    list: {
      status: false,  //是否显示列表
      count: '0',   //次数
      data: [],    //列表内容
      open: 0      //被展示的序号
    },
    title: '',
    content: '',
    info: '',
    imgs: [],
    imgLen: 0,
    upload: false,
    uploading: false,
    qiniu: '',
    showError: false
  },
  onLoad: function () {
    var _this = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log(app._user.wx.nickName);
        var info = '\r\n发布自：' + res.model;
        _this.setData({
          info: info
        });
      }
    });

  },
  openList: function (e) {
    //点击跳转管理自己的动态记录
    console.log("查看我的记录")
  },
  listenerTitle: function (e) {
    this.setData({
      'title': e.detail.value
    });
  },
  listenerTextarea: function (e) {
    this.setData({
      'content': e.detail.value
    });
  },
  submit: function () {
    
    var _this = this, title = '', content = '';
    //输入内容校验
    if(_this.data.content==''){
      app.showErrorModal('请输入动态内容。','内容为空');
      return false;
    }

    _this.setData({
      showError: true
    });
    
    wx.showModal({
      title: '提示',
      content: '是否确认分享？',
      success: function (res) {
        if (res.confirm) {
          if(_this.data.title==''){
      title = '【' + app._user.wx.nickName + '】';
    }else{
      title = '【' + _this.data.title + '】' 
    }
          
          content = _this.data.content + '\r\n\r\n' + _this.data.info;
          app.showLoadToast();
          wx.request({
            url: app._server + '/blog/pushblog.do',
            data: {
              openid: app.openid,
              nickname: title,
              pubissue: content
            },
            method: 'POST',
            header: {
      'content-type': 'application/x-www-form-urlencoded'
  },
            success: function (res) {
              console.log(res)
              if (res.data.status === 20010) {
                console.log('发布成功');
                var text = '注意:为了减少不必要的信息流，此条动态将会下一个凌晨3点被删除,您可通过点开资讯头条查看你发送的新鲜事。';
                wx.showModal({
                  title: '发布成功',
                  content: text,
                  showCancel: false,
                  success: function(res) {
                    wx.navigateBack();
                  }
                });
              } else {
                if (res.data.status >40000) {
                  if (res.data.status === 40700) {
                    app.showErrorModal('用户登陆状态校验失败，建议重新打开we华软', '提交失败');
                  }
                  if (res.data.status === 40701) {
                    app.showErrorModal('数据不全', '提交失败');
                  }
                  if (res.data.status === 40702) {
                    app.showErrorModal('请输入动态内容', '提交失败');
                  }
                   if (res.data.status === 40703||res.data.status === 40704) {
                    app.showErrorModal('太多人提交了，先缓一下', '提交失败');
                  }
                else{
      app.showErrorModal('错误代码：'+res.data.status, '提交失败');
                }

                }else{
                  app.showErrorModal('错误代码'+res.errMsg, '提交失败');
                }
              }
            },
            fail: function (res) {
              console.log(res);
              app.showErrorModal("服务器连接失败，请稍后再试", '提交失败');
            },
            complete: function () {
              wx.hideToast();
            }
          });
        }
      }
    });
  }
});