// pages/core/course/course.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    types: [
      "所有课程", "通识课", "公共课", "专业课", "研究生"
    ],
    type: "请选择课程类型",
    index: 0,
    name: "",
    history: []
  },
  type_param: ["", "Common", "PublicBasic", "Specialty", "yjs"],
  params: {
    type: "",
    name: "",
    teacher: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.getStorage({
      key: 'course_history',
      success: function(res) {
        console.log(res)
        that.setData({
          history: res.data
        })
      },
    })
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
  input_name: function(e) {
    this.params.name = e.detail.value;
  },
  input_teacher: function(e) {
    this.params.teacher = e.detail.value;
  },
  input_type: function(e) {
    this.setData({
      type: this.data.types[e.detail.value]
    })
    this.params.type = this.type_param[e.detail.value]
  },
  search: function() {
    if (this.data.name) {
      this.data.history.push(this.data.name)
      wx.setStorage({
        key: 'course_history',
        data: this.data.history,
      })
    }
    wx.navigateTo({
      url: 'search?name=' + this.params.name + "&teacher=" + this.params.teacher + "&type=" + this.params.type,
    })
  }
})