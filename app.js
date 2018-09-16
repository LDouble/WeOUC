//app.js
App({
  version: "v0.0.1",
  week: 1,
  remind: "",
  offline: false,
  unauth: true,
  onLaunch: function() {
    if (wx.getUpdateManager) { // 首先进行更新检测
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function(res) {
        console.log(res.hasUpdate)
      })
      updateManager.onUpdateReady(function() {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function(res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          }
        })
      })
      updateManager.onUpdateFailed(function() {
        // 新的版本下载失败

      })
    }
    var end_day = wx.getStorageSync("end_day") //从本地获取学期结束日期
    console.log(end_day)
    var that = this
    if (this.cmpDate(end_day) || !end_day) { // 当前缓存学期时间失效，重新获取。
      wx.request({
        url: that.server + '/config',
        success: function(res) {
          wx.setStorage({
            key: 'begin_day',
            data: res.data.kx_rq,
          })
          wx.setStorage({
            key: 'end_day',
            data: res.data.end_rq,
          })
          wx.setStorage({
            key: 'xn',
            data: res.data.xn,
          })
          wx.setStorage({
            key: 'xq',
            data: res.data.xq,
          })
          that.begin_day = res.data.kx_rq
          that.end_day = res.data.end_rq
          that.xn = res.data.xn
          that.xq = res.data.xq
          that.slides = res.data.slides //幻灯片
          wx.removeStorageSync("stuclass")
          that.calWeek()
        },
      })
    } else {
      this.begin_day = wx.getStorageSync("begin_day")
      this.xn = wx.getStorageSync("xn")
      this.xq = wx.getStorageSync("xq")
      this.calWeek()

    }
    wx.getNetworkType({ //判断是否有网络
      success: function(res) {
        if (res.networkType == "none") { //无网络
          that.offline = true;
          that.remind = "无网络"

        } else { // 有网络则请求服务器
          that.offline = false;
        }
      },
    });
    this.user_token = wx.getStorageSync("user_token")
    if (this.user_token) {
      this.unauth = false
    } else {
      this.remind = "unauth"
    }
  },
  globalData: {
    userInfo: null
  },
  calWeek: function() {
    var begin = new Date(this.begin_day).getTime()
    var now = new Date().getTime()
    var day = Math.ceil((now - begin) / 1000 / 60 / 60 / 24)
    this.week = Math.ceil(day / 7)
    console.log(this.week)
    return this.week
  },
  scui: require("scui/sc-ui"),
  cmpDate: function(date) { // 现在是否大于指定的时间。
    var now = new Date()
    var date = new Date(date)
    return now > date
  },
  server: "https://weouc.it592.com/api",
// server: "http://127.0.0.1:5000/api",

})