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
    if (app.openid === ''||app.openid ===null) {
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
      wx.hideNavigationBarLoading();
    }
    else {
      _this.setData({ openid: app.openid });
      _this.getStuinfo();
    }
    app._user.we=_this.data.stuinfo;
  },
  //连接服务器获取学生信息内容
  getStuinfo: function () {
    var _this = this;
    wx.showNavigationBarLoading();
    wx.request({
      url: app._server + '/mywebapp/stuinfo?openid=' + _this.data.openid,
      success: function (res) {
        if (res.data[0].status < 40000) {
          console.log(res.data[0].data);
          var stuinfo = JSON.parse(res.data[0].data);
          _this.setData({ stuinfo: stuinfo });
          wx.setStorageSync('stuinfo', stuinfo)
        }
        else{
          if(res.data[0].status >= 50000){
            app.showErrorModal("请稍后再打开此页面", res.data[0].data)
          }
          else{
            app.showErrorModal("请稍后再打开此页面，或者联系客服", "客户端异常")
          }
        }
      },
      fail: function () {
        app.showErrorModal("服务器连接失败", "请检查网络连接")
      },
      complete: function (){
       wx.hideNavigationBarLoading();
      }
    })
  },
  delbind: function () {
    setTimeout(function () {
      wx.showModal({
        title: '切换绑定？',
        content: '是否确认解除绑定,可解决数据不同步、异常等问题。为了数据安全，系统不允许频繁更换mysise账号，即与此微信账号解绑需要数小时生效，期间再次绑定仍默认登陆当前mysise账号。',
        cancelText: '点错了',
        confirmText: '是',
        success: function (res) {
          if (res.confirm) {
            app.showLoadToast('解绑中');
            wx.request({
              url: app._server + '/mywebapp/jiebang?openid=' + app.openid,
              method: 'GET', 
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
                app.openid='';
            wx.clearStorageSync();
            wx.navigateTo({
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