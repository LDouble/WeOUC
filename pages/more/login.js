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
    token: '',
    angle: 0
  },
  onLoad: function () {
    var _this = this;
    _this.getlogincode();
    setTimeout(function () {
      _this.setData({
        remind: ''
      });
    }, 1000);
  },
  onShow: function () {
    var _this = this;
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
    wx.startAccelerometer();
    app.showErrorModal('本系统只支持本科生，密码为教务处选课系统(jwgl.ouc.edu.cn)的密码,密码错误请前往选课系统核对', '登陆密码提醒');
  },

  onReady: function () {
    var _this = this;
    _this.getlogincode();
  },
  onHide: function(){
    var _this = this;
    _this.getlogincode();
    wx.stopAccelerometer();
  },
  //刷新logincode
  getlogincode: function () {
    wx.login({
      success: function (res) {
        if (res.code) {
          app.logincode = res.code;
        } else {
          app.showErrorModal("获取用户登录态失败！请重新打开We海大", res.errMsg);
        }
      }
    });
  },
  bind: function (e) {
    this.getlogincode()
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
    wx.request({ //绑定接口，获取信息.
      url: app._server + '/oucjw/bind',
      data:{
        username:_this.data.userid,
        password:_this.data.passwd,
        logincode:app.logincode,
      },
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      method:'POST',
      success: function (res) {
        wx.showToast({
              title: '请稍后...',
              icon: 'success',
              duration: 1000
            });
        //res.data 为返回的数据，200为绑定成功;
        if (res.data.status == 200) {
          app.token = res.data.token;
          console.log(res.data) //绑定成功后，则返回token。
          var stuinfo = res.data.user_info
          wx.setStorageSync("stuinfo", stuinfo)
          wx.setStorageSync("username", _this.data.userid)
          wx.setStorageSync("password", _this.data.passwd)
          app.username = _this.data.userid
          app.password = _this.data.passwd
          var stuclass = res.data.course;
          wx.setStorageSync('stuclass', stuclass);
          wx.setStorageSync('stuclass1', res.data.course2);//下个学期
          _this.setData({ token: res.data.token });
          try {
            wx.setStorageSync('token', app.token) //写入Storage
          } catch (e) {
            console.log(e);
          }
          app._user.is_bind = true;

          //询问用户跳转的页面
          setTimeout(function () {
            wx.showModal({
              title: '绑定成功',
              content: '恭喜你,绑定成功,即将跳转!',
              confirmText: '确定',
              showCancel:false,
              success: function (res) {
                if (res.confirm) {
                  wx.switchTab({
                    url: '/pages/more/more'
                  })
                }
              }
            });
          }, 1000);
        } else {
          wx.hideToast();
          //console.log("服务器返回失败的内容："+res.data[0])
          app.showErrorModal(res.data.message, '错误状态码:'+res.data.status);
          _this.getlogincode();
        }
      },
      fail: function (res) {
        wx.hideToast();
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
    if (e.detail.value.length >= 16) {
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
