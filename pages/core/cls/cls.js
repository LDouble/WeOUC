// pages/core/cls/cls.js
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    JA: ["鱼山新教", "鱼山旧教", "崂山二区", "崂山三区", "崂山四区", "崂山五区", "崂山六区", "崂山七区", "崂山八区"],
    index: 4
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
      building = 4
    this.setData({
      index: building
    })
    this.get_data(building)
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
    var that = this;
    var mydate = new Date();
    var day = mydate.getDay();
    if (day == 0)
      day = 7
    wx.request({
      url: app._server + '/classroom',
      data: {
        xn: app.xn,
        xq: app.xq,
        week: app.week,
        building: index,
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