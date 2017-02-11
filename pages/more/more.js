//more.js
//获取应用实例
var app = getApp();
Page({
  data: {
    user: {},
    openid: '',
    stuinfo: null,
  },
  onShow: function () {
    console.log(app._user.is_bind)
    var _this = this;
    this.getData();
    if (app.openid === '') {
      wx.navigateTo({
        url: '/pages/more/login'
      });
    } else {
      _this.setData({openid:app.openid});
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
          _this.setData({stuinfo:stuinfo});
          wx.setStorageSync('stuinfo', stuinfo)
        }
      },
      fail: function () {
        app.showErrorModal("服务器连接失败", "请检查网络连接")
      }
    })
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