//sdf.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    userName: '',
    renderData: {}
  },

  onLoad: function(){
    var _this = this;
    var token = wx.getStorageSync("token")
    this.token = token
    if(!token){
      _this.setData({
        remind: '未绑定帐号'
      });
      return false;
    }
    var roominfo = wx.getStorageSync("room");
    if(!roominfo)
      _this.getroom(token)
    else
      _this.queryDL(roominfo)
    app._user.we = wx.getStorageSync("stuinfo")
    _this.setData({
      userName: app._user.we.name,
      userYkth: app._user.we.xh
    });
    //判断并读取缓存
    if(app.cache.sdf){ _this.sdfRender(app.cache.sdf); }
    
  },
  getroom:function(token){
    token = this.token
    var _this = this
wx.showNavigationBarLoading();
wx.request({
  url: app._server + '/hq/roomid',
  method: 'POST',
  header: { "Content-Type": "application/x-www-form-urlencoded" },
  data: {
    token: app.token
  },
  success: function (res) {
    if (res.data && res.data.status === 1) {
      var info = res.data.data;
      if (info) {
        //保存roomid
        app.saveCache('room', info);
        _this.queryDL(info);
      } else {
        _this.setData({ remind: '获取宿舍失败' });
      }

    } else {
      app.removeCache('sdf');
      _this.setData({
        remind: res.data.message || '未知错误'
      });
    }
  },
  fail: function (res) {
    if (_this.data.remind == '加载中') {
      _this.setData({
        remind: '网络错误'
      });
    }
    console.warn('网络错误');
  },
  complete: function () {
    wx.hideNavigationBarLoading();
  }
})
},
  queryDL:function(info){
    var _this = this
    wx.showNavigationBarLoading();
    wx.request({
      url: app._server + '/hq/dfye',
      method: 'POST',
      data: {
        roomid: info.roomid,
        xiaoquid: info.xiaoquid,
      },
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      success: function (res) {
        if (res.data && res.data.status === 1) {
          var info = res.data.data;
          if (info) {
            //保存电费缓存
            app.saveCache('sdf', info);
            _this.sdfRender(info);
          } else { _this.setData({ remind: '暂无数据' }); }

        } else {
          app.removeCache('sdf');
          _this.setData({
            remind: res.data.message || '未知错误'
          });
        }
      },
      fail: function (res) {
        if (_this.data.remind == '加载中') {
          _this.setData({
            remind: '网络错误'
          });
        }
        console.warn('网络错误');
      },
      complete: function () {
        wx.hideNavigationBarLoading();
      }
    });
  },
   sdfRender:function(info){
     var _this = this
     if(!info)  
     return 0;
      info.chargeAmp = info.chargeAmp.toFixed(2)
      info.restAmp = info.restAmp.toFixed(2)
      info.monthTotalAmp = info.monthTotalAmp.toFixed(2)
      _this.setData({
      'renderData': info,
      'renderData.room_name': info.xiaoqu + info.room,
      remind: ''
    });
  }
});