//more.js
//获取应用实例
var app = getApp();
Page({
  data: {
    user: {},
    openid: '',
    stuinfo: null,
  },
  onLoad: function () {
    if (app.openid === '') {
      wx.navigateTo({
        url: '/pages/more/login'
      });
    }
    else {
      app._user.is_bind = true;
    }
  },
  onShow: function () {
    console.log(app._user.is_bind)
    var _this = this;
    this.getData();
    if (wx.getStorageSync('stuinfo')) {
      var stuinfo = wx.getStorageSync('stuinfo')
      _this.setData({ stuinfo: stuinfo });
    }
    else {
      app.showLoadToast('更新数据',1500);
      _this.setData({ openid: app.openid });
      _this.getStuinfo();
    }



  },
  //连接服务器获取学生信息内容
  getStuinfo: function () {
    var _this = this;
    wx.request({
      url: app._server + '/mywebapp/stuinfo?openid=' + _this.data.openid,
      success: function (res) {
        if (res.data[0].status < 40000) {
          console.log(res.data[0].data);
          var stuinfo = JSON.parse(res.data[0].data);
          _this.setData({ stuinfo: stuinfo });
          wx.setStorageSync('stuinfo', stuinfo)
        }
      },
      fail: function () {
        app.showErrorModal("服务器连接失败", "请检查网络连接")
      }
    })
  },
  delbind: function () {
    setTimeout(function () {
      wx.showModal({
        title: '切换绑定',
        content: '是否确认解除绑定,可解决数据不同步、异常等问题',
        cancelText: '点错了',
        confirmText: '是',
        success: function (res) {
          if (res.confirm) {
            app.openid=null;
            wx.clearStorageSync();
            wx.navigateTo({
              url: '/pages/more/login'
            });
          } else {
            wx.showToast({
              title: '取消解绑操作',
              icon: 'success',
              duration: 1000
            });
          }
        }
      });
    }, 100);
  },
  gobind: function () {
    wx.navigateTo({
      url: '/pages/more/login'
    });
  },
  getData: function () {
    var _this = this;
    var days = ['一', '二', '三', '四', '五', '六', '日'];
    _this.setData({
      'user': app._user,
      'time': {
        'term': app._time.term,
        'week': app._time.week,
        'day': days[app._time.day - 1]
      },
      'is_bind': !!app._user.is_bind
    });
  }
});