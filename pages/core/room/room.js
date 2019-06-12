// pages/core/room/room.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    building: [
      ["今天", "明天", "后天"],
      ["鱼山新教", "鱼山旧教", "崂山二区", "崂山三区", "崂山四区", "崂山五区", "崂山六区", "崂山七区", "崂山八区"]
    ],
    index: [0, 4]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var building = wx.getStorageSync("building")
    if (!building)
      building = [0, 4]
    this.setData({
      index: [0,building[1]]
    })
    building[0] = 0;
    this.get_data(building)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var first = wx.getStorageSync("first");
    if (!first) {
      wx.showModal({
        title: '使用帮助',
        content: '1、数据仅供参考，主要根据选课系统与研究生系统中的数据得到。\r\n2、点击上方的时间-地点切换可以进行教学区和时间的选择地点\r\n3、点击"课"的方格会显示该教室正在上什么课程',
        confirmText: "我明白了",
        cancelText: "图文教程",
        success: function(res) {
          if (res.cancel) {
            wx.navigateTo({
              url: '/pages/web/web?url=' + "https://mp.weixin.qq.com/s/7PpCu4RpaJTN19n2stpNYA",
            })
          }
          if(res.confirm){
            wx.setStorage({
              key: 'first',
              data: 'yes',
            })
          }
        }
      })
    }
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
  bindPickerChange: function(e) {
    var index = (e.detail.value)
    this.setData({
      index: index
    });
    wx.setStorageSync("building", index)
    this.get_data(index)
  },
  get_data: function(index) {
    wx.showLoading({
      title: '加载中',
    })
    // 判断时间
    var that = this;
    var mydate = new Date();
    var day = mydate.getDay();
    if (day == 0)
      day = 7
    day = day + index[0] // 加天数。
    var week = app.week
    if (day > 7) {
      day = day % 7 // 8,9 下一周了。
      week += 1
    }
    wx.request({
      url: app.server + '/classroom/2.0',
      data: {
        xn: app.xn,
        xq: app.xq,
        week: week,
        building: index[1],
        day: day
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function(res) {
        var data = (res.data.data)
        that.setData({
          rooms: data
        })
      },
      fail: function(res) {
        wx.showToast({
          title: '请求失败',
        })
      },
      complete: function(res) {
        wx.hideLoading()
      }
    })
  },
  show: function(e) {
    var course = e.currentTarget.dataset.wpyshowA
    if (course) {
      wx.showModal({
        title: '正在上课',
        content: course.name + "  " + course.orgin,
      })
    }
  }
})