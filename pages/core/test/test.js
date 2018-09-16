// pages/core/test/test.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    app.jwc = app.jwc ? app.jwc : wx.getStorageSync("jwc")
    app.user_token = app.user_token ? app.user_token : wx.getStorageSync("user_token")
    if (!app.user_token) {
      app.remind = "未绑定"
      wx.navigateTo({
        url: '/pages/index/index'
      });
      return
    }
    this.setData({
      "xh": app.jwc.xh
    })
    if (app.offline) {
      var ks = wx.getStorageSync("test")
      this.render_ks(ks)
    } else
      this.get_ks()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.get_ks()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  render_ks: function(ks) {
    var tests = []
    for (var i in ks) {
      if (ks[i].time != "") {
        var pattern = /(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})-(\d{2}:\d{2})/;
        // console.log(list[i].time)
        var arr = pattern.exec(ks[i].time);
        ks[i].date = ks[i].time
        if (!arr) {
          continue;
        }
        var date = arr[1]; //获取时间进行判断
        var ss = date + " " + arr[2];
        ss = ss.replace(/\-/g, "/");
        var to = new Date(ss).getTime() - new Date().getTime();
        if (to / 1000 / 60 >= 40) {
          ks[i].num = "请先通过选课系统查询。备用查询考试前35分钟公布";
          ks[i].address = "请先通过选课系统查询。备用查询考试前35分钟公布";
        }
        tests.push(ks[i])
      }
    }
    if (tests.length)
      this.setData({
        tests: tests,
        remind: ""
      })
    else
      this.setData({
        remind: "没有找到考试安排"
      })
  },
  get_ks: function() {
    if (!app.jwc) {
      this.setData({
        "remind": "请先绑定"
      })
      return
    }
    var _this = this;
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      remind: "update"
    })
    wx.request({
      url: app.server + "/test",
      data: app.jwc,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function(res) {
        res = res.data
        var ks = res.data.sort(function(a, b) {
          var y = a['time'];
          var x = b['time'];
          console.log(x)
          if (x == ".")
            return -5
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
        wx.setStorageSync('ks', ks);
        _this.render_ks(ks)
        if (_this.data.pull) {
          _this.data.pull = false
          wx.stopPullDownRefresh()
        }
      },
      fail: function(error) {
        var ks = wx.getStorageSync("ks")
        if (ks) {
          _this.render_ks(ks)
          _this.setData({
            offline: true,
          })
        } else
          _this.setData({
            remind: "暂无考试安排",
          })
        if (_this.data.pull) {
          _this.data.pull = false
          wx.stopPullDownRefresh()
        }
      },
      complete: function(res) {
        wx.hideLoading();
        wx.stopPullDownRefresh()
      }
    });
  }
})