//login.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    help_status: false,
    userid_focus: false,
    passwd_focus: false,
    userid: '',
    passwd: '',
    openid: '',
    angle: 0
  },
  onLoad: function () {
    var _this = this;
  },
  onShow: function () {
    var _this = this;
    _this.getlogincode();
    console.log("login.onshow输出的" + app.logincode);
  },

  onReady: function () {
    var _this = this;
    setTimeout(function () {
      _this.setData({
        remind: ''
      });
    }, 1000);
    wx.onAccelerometerChange(function (res) {
      var angle = -(res.x * 30).toFixed(1);
      if (angle > 14) { angle = 14; }
      else if (angle < -14) { angle = -14; }
      if (_this.data.angle !== angle) {
        _this.setData({
          angle: angle
        });
      }
    });
  },
  //刷新logincode
  getlogincode: function () {
    wx.login({
      success: function (res) {
        if (res.code) {
          app.logincode = res.code;
        } else {
          app.showErrorModal("获取用户登录态失败！请重新打开We华软", res.errMsg);
        }
      }
    });
  },
  bind: function (e) {
    //console.log(e.detail.formId);
    var _this = this;
    if (app.g_status) {
      app.showErrorModal(app.g_status, '绑定失败');
      return;
    }
    if (!_this.data.userid || !_this.data.passwd) {
      app.showErrorModal('账号及密码不能为空', '提醒');
      return false;
    }
    app.showLoadToast('绑定中');
    wx.showNavigationBarLoading();
    wx.request({
      url: app._server + '/mywebapp/login?username=' + _this.data.userid + '&password=' + _this.data.passwd + '&logincode=' + app.logincode,
      success: function (res) {
        wx.showToast({
              title: '请稍后...',
              icon: 'success',
              duration: 1000
            });
        console.log("登陆请求成功输出的" + app.logincode);
        console.log(res.data[0])
        //小于40000则登陆成功
        if (res.data[0].status < 40000) {
          
          //清除缓存
          //app.cache = {};
          //wx.clearStorage();

          app.openid = res.data[0].openid;
          _this.setData({ openid: res.data[0].openid });
          //向缓存同步写入openid
          //app.saveCache('openid', app.openid)
          try {
            wx.setStorageSync('openid', app.openid)
          } catch (e) {
            console.log(e);
          }
          app._user.is_bind = true;
          _this.getlogincode();
          //询问用户跳转的页面
          setTimeout(function () {
            wx.showModal({
              title: '连接服务器成功',
              content: '是否授权登陆mysise？',
              cancelText: '否',
              confirmText: '是',
              success: function (res) {
                if (res.confirm) {
                  wx.switchTab({
                    url: '/pages/more/more'
                  })
                } else {
                  _this.showErrorModal('同意授权才可以登陆噢~~', '授权失败');
                  _this.getlogincode();
                  return false;
                }
              }
            });
          }, 1500);
        } else {
          wx.hideToast();
          //console.log("服务器返回失败的内容："+res.data[0])
          app.showErrorModal(res.data[0].data, '错误状态码:'+res.data[0].status);
          _this.getlogincode();
        }
      },
      fail: function (res) {
        wx.hideToast();
        console.log(res)
        app.showErrorModal('请检查网络', '服务器连接失败!');
        _this.getlogincode();
      },
      complete: function (){
       wx.hideNavigationBarLoading();
      }
    });
  },
  useridInput: function (e) {
    this.setData({
      userid: e.detail.value
    });
    if (e.detail.value.length >= 10) {
      wx.hideKeyboard();
    }
  },
  passwdInput: function (e) {
    this.setData({
      passwd: e.detail.value
    });
  },
  inputFocus: function (e) {
    if (e.target.id == 'userid') {
      this.setData({
        'userid_focus': true
      });
    } else if (e.target.id == 'passwd') {
      this.setData({
        'passwd_focus': true
      });
    }
  },
  inputBlur: function (e) {
    if (e.target.id == 'userid') {
      this.setData({
        'userid_focus': false
      });
    } else if (e.target.id == 'passwd') {
      this.setData({
        'passwd_focus': false
      });
    }
  },
  tapHelp: function (e) {
    if (e.target.id == 'help') {
      this.hideHelp();
    }
  },
  showHelp: function (e) {
    this.setData({
      'help_status': true
    });
  },
  hideHelp: function (e) {
    this.setData({
      'help_status': false
    });
  }
});