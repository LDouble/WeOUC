var app = getApp()
Page({
  data: {
    help: {
      helpStatus: false,
      faqList: [{
          question: '1.为什么余额不准确?',
          answer: '宿舍电费每天10点更新电量，因此本数据仅供参考，当电量过低时请提前充值。'
        },
        {
          question: '2.如何充电费?',
          answer: '请下载海大后勤app进行电费充值。'
        }
      ]
    },
    df:{
      restAmp:0
    }
  },
  // 帮助
  showHelp: function() {
    this.setData({
      'help.helpStatus': true
    });
  },
  hideHelp: function(e) {
    if (e.target.id === 'help' || e.target.id === 'close-help') {
      this.setData({
        'help.helpStatus': false
      });
    }
  },
  onLoad: function() {
    var _this = this;
    if (app.user_token === '' || app.user_token === null) {
      app.remind = "未绑定"
      wx.navigateTo({
        url: '/pages/index/index'
      });
    }
    this.xh = app.xh || wx.getStorageSync("xh")
    this.params = {
      "xh": this.xh
    }
  },
  onShow: function() {
    this.setData({
      offline: app.offline
    })
    if (!app.offline)
      this.get_df()
    else {
      var df = wx.getStorageSync("df")
      _this.dfRender(df)
    }
  },
  get_df: function() {
    var _this = this;
    var _this = this;
    app.http.post({
      url: app._server + "/df",
      params: this.params
    }).then((res) => {
      var df = res.data
      var info = res.info
      wx.setStorageSync('df', df);
      if (!this.room)
        wx.setStorageSync("room", info)
      _this.dfRender(df)
    }).catch((error) => {
      var df = wx.getStorageSync("df")
      _this.dfRender(df)
      _this.setData({
        offline: true
      })
      console.log(error)
    })
  },
  dfRender: function(data) {
    this.setData({"df":data})
  }
});