//issues.js
//获取应用实例
var app = getApp();
Page({
  data: {
    list_remind: '加载中',
    mockname_status: false,
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
    showError: false,
    id: '',
    type: ''
  },
  onLoad: function (options) {
    var _this = this;
    _this.setData({
      id: options.id,
      type: options.type
    });
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
    title = app._user.wx.nickName;
          
    content = _this.data.content;
    app.showLoadToast();
    wx.request({
        url: app._server + '/blog/pushcomment.do',
        data: {
          openid: app.openid,
          id: _this.data.id,
          type: _this.data.type == 'all' ? 'blog' : _this.data.type,
          pubissue: content,
          nickname: title
        },
        method: 'POST',
        header: {
      'content-type': 'application/x-www-form-urlencoded'
  },
            success: function (res) {
              console.log(res)
              if (res.data.status === 20010) {
                console.log('发布成功');
                var text = '评论成功';
                wx.showModal({
                  title: '评论成功',
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
});