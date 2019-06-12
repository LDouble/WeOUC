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
    } else {
      if (parseInt(app.xq) + 1 == 3) {
        xn = parseInt(app.xn) + 1;
        xq = 0;
      } else {
        xn = app.xn;
        xq = app.xq;
      }
      this.get_result(xn, xq)
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // 在页面中定义插屏广告
    let interstitialAd = null

    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-f352d643d0b09c03'
      })
      interstitialAd.onLoad(() => {})
      interstitialAd.onError((err) => {})
      interstitialAd.onClose(() => {})
    }

    // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }
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
    this.get_result(app.xn, app.xq)
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
  get_result: function(xn, xq) {
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
    var data = app.jwc;
    data.xn = xn
    data.xq = xq
    wx.request({
      url: app.server + "/xk_result",
      data: app.jwc,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function(res) {
        res = res.data.data
        data = []
        for (i = 0; i < res.length; i++) {
          data.push({
            "name": res[i]["[课程号]课程名"],
            "teacher": res[i]["任课教师"],
            "xkb": res[i]["权重分"],
            "status": res[i]["选课状态"],
            "xkh": res[i]["选课号"],
            "user": res[i]["提交人"],
          })

        }
        console.log(data)
        _this.setData({
          data: data,
          remind: ""
        })
      },
      fail: function(error) {
        var ks = wx.getStorageSync("ks")
      },
      complete: function(res) {
        wx.hideLoading();
        wx.stopPullDownRefresh()
      }
    });
  },
  update: function() {
    var date = new Date;
    var year = date.getFullYear();
    var itemlist = ["本学期", year - 1 + "夏(小学期)", year - 1 + "秋", year + "春", year + "夏(小学期)", year + "秋"]
    var item = [{
        xn: app.xn,
        xq: app.xq
      }, {
        xn: year - 1,
        xq: 0
      }, {
        xn: year - 1,
        xq: 1
      },
      {
        xn: year - 1,
        xq: 2
      }, {
        xn: year,
        xq: 0
      }, {
        xn: year,
        xq: 1
      },
    ]
    var _this = this;
    wx.showActionSheet({
      itemList: itemlist,
      success: function(res) {
        var params = item[res.tapIndex];
        _this.get_result(params.xn, params.xq)
      }
    })
  },
})