// pages/index/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    plain:true,
    "core": [
      { id: 'kb', name: '课表', disabled: true, teacher_disabled: false, offline_disabled: true },
      { id: 'cj', name: '成绩', disabled: true, teacher_disabled: true, offline_disabled: false },
      { id: 'ks', name: '考场', disabled: true, teacher_disabled: true, offline_disabled: true },
      { id: 'kjs', name: '空教室', disabled: false, teacher_disabled: true, offline_disabled: false },
      { id: 'sdf', name: '电量查询', disabled: true, teacher_disabled: true, offline_disabled: false },
      { id: 'cjfx', name: '成绩分析', disabled: true, teacher_disabled: true, offline_disabled: false }
    ],
    "swiper_height": 200,
    "notices": [
      { id: "1", cover: "https://u-dl.fotor.com.cn/uid_0c94e8f3382e4db4b4f8f0300eff6063o/b439c810-6ae9-11e8-91cb-8d4b06811576/%E6%9C%AA%E5%91%BD%E5%90%8D%E8%AE%BE%E8%AE%A1.jpg?0.18393008301041913" }
    ],
    nothingclass: 1,
    remind: "未绑定" //未绑定，未授权，加载中
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
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

  },
  /* 通知调转*/
  noticeTo: function (e) {
    console.log(e.target.dataset.id)
  },
  submit: function (e) {
    console.log(e.detail.formId);
  },

  /*授权、登陆操作 */
  auth: function (e) {
    console.log(e)
    app.http.post({
      url: app._server + '/oucjw/version'
    }).then(data => {
      console.log(data)
    }).catch((error) => {
      consolg.log(error)
    }
      )
  }
})