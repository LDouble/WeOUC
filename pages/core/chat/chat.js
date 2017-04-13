// pages/core/chat/chat.js
var app = getApp()
Page({
  data: {},
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
   //前往游戏界面
      gotoGame: function () {
        wx.navigateTo({
          url: '/pages/game/game'
        })
      }
})