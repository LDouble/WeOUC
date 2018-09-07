// pages/core/score/score.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jd: NaN,
    aver_score: NaN,
    total_xf: NaN,
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
      var cj = wx.getStorageSync("cj")
      this.render_cj(cj)
    } else
      this.get_cj()
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
    this.get_cj()
    this.setData({
      selectedAllStatus: false,
    })
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
  calgpa: function() {
    var cjInfo = this.data.cjInfo;
    var i;
    var credit = 0,
      totaljd = 0,
      xf = 0
    var totalfs = 0,
      totalxf = 0;
    for (i = 0; i < cjInfo.length; i++) {
      cjInfo[i].xf = parseFloat(cjInfo[i].xf)
      if (cjInfo[i].selected && cjInfo[i].jd) {
        credit += cjInfo[i].xf;
        totaljd += cjInfo[i].jd * cjInfo[i].xf;
      }
      if (cjInfo[i].selected) {
        var tcj = this.cjhs(cjInfo[i].score)
        if (tcj && tcj >= 60) {
          totalfs += tcj * cjInfo[i].xf //计算分数
          totalxf += cjInfo[i].xf //计算学分
        }
      }
      if (cjInfo[i].selected)
        xf += cjInfo[i].xf;
    }
    var jd = 0,
      aver = 0
    if (credit)
      jd = totaljd / credit;
    else
      jd = 0;
    if (totalxf)
      aver = totalfs / totalxf;
    this.setData({
      'jd': jd.toFixed(3),
      'total_xf': xf,
      'aver_score': aver.toFixed(3)
    })
  },
  bindCheckbox: function(e) {
    /*绑定点击事件，将checkbox样式改变为选中与非选中*/
    //拿到下标值，以在cjInfo作遍历指示用
    var index = parseInt(e.currentTarget.dataset.index);
    //原始的icon状态
    var selected = this.data.cjInfo[index].selected;
    var cjInfo = this.data.cjInfo;
    // 对勾选状态取反
    cjInfo[index].selected = !selected;
    // 写回经点击修改后的数组
    this.setData({
      cjInfo: cjInfo
    });
    this.calgpa()
  },
  cjhs: function(cj) {
    if (parseFloat(cj)) {
      return cj;
    } else {
      switch (cj) {
        case "优秀":
        case "优":
          return 90;
        case "良":
        case "良好":
          return 80;
        case "中":
        case "中等":
          return 70;
        case "合格":
        case "及格":
          return 60
        case "不合格":
        case "不及格":
          return 0
        default:
          return undefined
      }
    }
  },
  bindSelectAll: function() {
    // 环境中目前已选状态
    var selectedAllStatus = this.data.selectedAllStatus;
    // 取反操作
    selectedAllStatus = !selectedAllStatus;
    var cjInfo = this.data.cjInfo;
    // 遍历
    for (var i = 0; i < cjInfo.length; i++) {
      cjInfo[i].selected = selectedAllStatus;
    }
    this.setData({
      selectedAllStatus: selectedAllStatus,
      cjInfo: cjInfo
    });
    this.calgpa()
  },
  get_cj: function() {
    var that = this;
    wx.showLoading({
      remind: 'update',
    })
    wx.request({
      url: app.server + "/cj",
      data: app.jwc,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function(res) {
        res = res.data
        if (res && res.data)
          var cj = res.data.reverse()
        else
          var cj = []
        wx.setStorageSync('cj', cj);
        that.render_cj(cj)
        if (that.data.pull) {
          that.data.pull = false
          wx.stopPullDownRefresh()
        }
      },
      fail: function(error) {
        var cj = wx.getStorageSync("cj")
        that.render_cj(cj)
        that.setData({
          offline: true
        })
        if (that.data.pull) {
          that.data.pull = false
          wx.stopPullDownRefresh()
        }
      },
      complete: function(res) {
        wx.hideLoading();
        wx.stopPullDownRefresh()
      }
    });
  },
  render_cj: function(data) {
    this.setData({
      cjInfo: data,
      remind: ''
    });
    this.bindSelectAll()
  }
})