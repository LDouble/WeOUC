//more.js
//获取应用实例
var app = getApp();
Page({
  data: {
    user: {},
    token: '',
    stuinfo: null,
  },
  onLoad: function () {
    if (app.token == ''||app.token ==null) {
      wx.navigateTo({
        url: '/pages/more/login'
      });
    }
    else {
      app._user.is_bind = true;
    }
  },
  onShow: function () {
    var _this = this;
    this.getData();
    if (wx.getStorageSync('stuinfo')) {
      var stuinfo = wx.getStorageSync('stuinfo')
      _this.setData({ stuinfo: stuinfo });
      wx.hideNavigationBarLoading();
    }
    else {
      _this.setData({ token: app.token });
      _this.getStuinfo();
    }
    app._user.we=_this.data.stuinfo;
  },
  //连接服务器获取学生信息内容
  getStuinfo: function () {
    var _this = this
    app.getStuinfo(function(stuinfo){
      _this.setData({ 'stuinfo': stuinfo });   
    })           
  },
  delbind: function () {
    setTimeout(function () {
      wx.showModal({
        title: '切换绑定？',
        content: '是否确认解除绑定,可解决数据不同步、异常等问题。为了保证服务器的稳定，请不要反复解绑',
        cancelText: '点错了',
        confirmText: '是',
        success: function (res) {
          if (res.confirm) {
            app.showLoadToast('解绑中');
            wx.request({
              url: app._server + '/oucjw/unbind',
              method: 'POST',
              header: { "Content-Type": "application/x-www-form-urlencoded" },
              data:{
                token:app.token
              },
              success: function(res){
                  wx.showToast({
                title: '解绑成功',
                icon: 'success',
                duration: 1000
              });
              },
              fail: function() {
                // fail
              },
              complete: function() {
                app.token='';
            wx.clearStorageSync();
            app.getUser();
            wx.reLaunch({
              url: '/pages/more/login'
            });
              }
            })

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
