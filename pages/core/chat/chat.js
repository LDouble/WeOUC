// pages/core/chat/chat.js
var app = getApp()
Page({
  data: {
    time:0
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    if (app.token === '' || app.token === null) {
      //console.log("onshow token获取的缓存为空");
      wx.navigateTo({
        url: '/pages/more/login'
      });
    }
    
  },
  onReady: function () {
    // 页面渲染完成
    this.gettime()
  },
  onShow: function () {

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
   //
      go: function (e) {
        var _this = this;
        var to = new Date("2018-01-13 00:00").getTime() - new Date().getTime();
        var flag = 0;
        if (to > 0) {
          app.showErrorModal("1月13日零点开通通知服务");
          _this.setData({
            remind: '暂未开启'
          });
          return;
                  }
          if (this.data.time == 15){
          app.showErrorModal("当前次数已超过15次，请改日再增加！");
          _this.setData({
            remind: '网络错误'
          });
          return;
        }
        wx.request({
          url: app._server + '/oucjw/addformid',
          method: 'POST',
          header: { "Content-Type": "application/x-www-form-urlencoded" },
          data: {
            'formid': e.detail.formId,
            token:app.token,
          },
          success: function (res) {
            if (res.data && res.data.status === 1) {
              _this.setData({ 'time': res.data.cnt })
            } else {
              app.showErrorModal(res.errMsg);
              _this.setData({
                remind: '网络错误'
              });
          }},
          fail: function () {
            app.showErrorModal(res.errMsg);
            _this.setData({
              remind: '网络错误'
            });
          }
        })
      },
      gettime:function(){
        var _this = this;
        wx.request({
          url:app._server + '/oucjw/getformid',
          method:'POST',
          header: { "Content-Type": "application/x-www-form-urlencoded"         },
          data:{
            token:app.token
          },
          success:function(res){
            if (res.data && res.data.status === 1) {
              _this.setData({'time': res.data.cnt})
            } else {
              app.showErrorModal(res.errMsg);
              _this.setData({
                remind: '网络错误'
              });
          }},
          fail:function(res){
            app.showErrorModal(res.errMsg);
            _this.setData({
              remind: '网络错误'
            });
          }
        })
      }
})