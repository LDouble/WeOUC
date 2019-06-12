//app.js
App({
  version: "v1",
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
    if (wx.getStorageSync("version") != this.version) { //需要清空所有数据，重大版本变化
      wx.clearStorageSync()
      wx.setStorageSync("version", this.version)
    }
    var end_day = wx.getStorageSync("end_day") //从本地获取学期结束日期
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
          that.low_day = new Date().getTime() < (new Date(that.begin_day).getTime() + 24 * 60 * 60 * 1000 * 15) // 判断是否小于15天，
          that.calWeek()
        },
      })
    } else {
      this.begin_day = wx.getStorageSync("begin_day")
      this.xn = wx.getStorageSync("xn")
      this.xq = wx.getStorageSync("xq")
      this.calWeek()
      that.low_day = new Date().getTime() < (new Date(that.begin_day).getTime() + 24 * 60 * 60 * 1000 * 15)
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
    if (wx.onUserCaptureScreen) { // 兼容性处理。
      wx.onUserCaptureScreen(function(res) {
        var pages = getCurrentPages() //获取加载的页面
        var currentPage = pages[pages.length - 1] //获取当前页面的对象
        var url = currentPage.route //当前页面url
        if (url == "pages/core/timetable/timetable") {
          wx.showModal({
            title: '友情提示',
            content: '数据仅供参考，课表会根据单双周进行切换显示，尤其是MOOC见面课。建议每天查看需要上什么课',
          })
        }
      })
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
    return this.week
  },
  cmpDate: function(date) { // 现在是否大于指定的时间。
    var now = new Date()
    var date = new Date(date)
    return now > date
  },
  add_formid: function(formid) {
    var that = this
    wx.request({
      url: that.server + "/add_formid",
      data: {
        user_token: that.user_token,
        formid: formid
      },
      method: "POST",
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  get_user: function(formid) {
    var that = this
    wx.request({
      url: that.server + "/add_formid",
      data: {
        user_token: that.user_token,
        formid: formid
      },
      method: "POST",
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  server: "https://weouc.it592.com/api",
  //server: "http://127.0.0.1:5000/api",

})