// pages/my/my.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      href: '/pages/more/user/user',
      avatar: '/images/more/avatar.png',
      nickName: 'WeOUC',
      bind: false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({is_notice:wx.getStorageSync("score_notice")})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.name = app.name || wx.getStorageSync("name")
    app.xh = app.xh || wx.getStorageSync("xh")
    var score_notice = wx.getStorageSync("score_notice") || false
    if (app.xh) {
      userInfo = {
        avatar: '/images/more/avatar@active.png',
        nickName: app.name,
        xh: app.xh
      }
      var bind = true;
    } else {
      var userInfo = {
        href: '/pages/more/user/user',
        avatar: '/images/more/avatar.png',
        nickName: 'WeOUC',
        bind: false
      }
      var bind = false;
    }
    this.setData({
      userInfo: userInfo,
      bind: bind,
    })
  },

  unbind: function () {
    var _this = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app._server + "/unbind",
      data: {
        user_token: app.user_token || wx.getStorageSync("user_token")
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function (res) {
        res = res.data
        wx.clearStorageSync() //清除缓存
        app.user_token = ""
        app.xh = "",
          app.remind = "未绑定"
        wx.reLaunch({
          url: '/pages/index/index',
        })
        wx.hideLoading();
        wx.showToast({
          title: '解绑成功',
        })
        wx.setStorageSync("version", app.version)
      },
      fail: function (error) {
        wx.hideLoading();
        wx.showToast({
          title: '解绑失败',
        })
      },
      complete: function (res) { }
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  notice: function (e) {
    console.log(e)
    var score = e.detail.value ? 1 : 0
    var _this = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app._server + "/notice",
      data: {
        score: score,
        user_token: app.user_token
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function (res) {
        if (res.statusCode != 200) {
          wx.hideLoading();
          wx.showToast({
            title: '请解绑重试',
          })
          return
        }
        res = res.data
        wx.hideLoading();
        wx.showToast({
          title: '修改成功',
        })
        wx.setStorageSync("score_notice", e.detail.value)
      },
      fail: function (error) {
        wx.hideLoading();
        wx.showToast({
          title: '请解绑重试',
        })
      },
      complete: function (res) {

      }
    });
  },

  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})