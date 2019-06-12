// pages/core/course/search.js
var app = getApp()
var page = 1
var params;
var courses = [];
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
    params = options
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
    courses = []
    page = 1
    this.setData({
      courses: courses
    })
    this.get_data()
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
    this.setData({
      is_bottom: false
    })
    this.get_data(true)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.is_bottom == true)
      return
    this.get_data()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  get_data(refresh = false) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    if (refresh == true) {
      page = 1
      courses = []
    }
    params.page = page
    wx.request({
      url: app.server + '/search_course',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: params,
      success: function(res) {
        if (res.data.data && res.data.data.length > 0) {
          courses = courses.concat(res.data.data)
          that.setData({
            courses: courses
          })
          page += 1
        } else {
          that.setData({
            is_bottom: true
          })
        }

      },
      fail: function(err) {

      },
      complete: function(res) {
        wx.hideLoading();
        if (refresh)
          wx.stopPullDownRefresh();
      }
    })
  }
})