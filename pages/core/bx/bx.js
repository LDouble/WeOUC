//bx.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    count: '-',
    openid: '',
    list: [],
    process_state: {
      '未审核': 'waited',
      '请假': 'waited',
      '全勤': 'accepted',
      '旷课': 'dispatched',
      '未知': 'refused'
    }
  },
  //下拉更新
  onPullDownRefresh: function () {
    this.getData();
    wx.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 1500
    });
  },
  onLoad: function () {
    var _this = this;
    if (app.openid === '' || app.openid === null) {
      console.log("onload openid获取的缓存为空");
      wx.navigateTo({
        url: '/pages/more/login'
      });
    }
    _this.setData({
      openid: app.openid
    });
    _this.getData();
  },
  getData: function () {
    var _this = this;
    wx.showNavigationBarLoading();
    wx.request({
      url: app._server + "/mywebapp/kaoqin?openid=" + _this.data.openid,
      method: 'GET',
      success: function (res) {
        console.log(res);
        if (res.data[0].status < 40000) {
          
          if (res.data[0].status ==20040) {
            _this.setData({
              'remind': '居然不用考勤'
            });
          }
          else {
            var list = JSON.parse(res.data[0].data);
          console.log(list);
            for (var i = 0, len = list.length; i < len; i++) {
              var tempstat = list[i].information;
              if (tempstat.indexOf("全勤") != -1) {
                list[i].state = _this.data.process_state['全勤'];
              }
              else if (tempstat.indexOf("请假") != -1) {
                list[i].state = _this.data.process_state['请假'];
              }
              else if (tempstat.indexOf("旷课") != -1) {
                list[i].state = _this.data.process_state['旷课'];
              } else {
                list[i].state = _this.data.process_state['未知'];
              }
            }
            _this.setData({
              'list': list,
              'count': len,
              'remind': ''
            });
          }
        } else {
          _this.setData({
            remind: res.data.message || '未知错误',
            'count': 0
          });
        }
      },
      fail: function (res) {
        app.showErrorModal(res.errMsg);
        _this.setData({
          remind: '网络错误',
          'count': 0
        });
      },
      complete: function () {
        wx.stopPullDownRefresh();
        wx.hideNavigationBarLoading();
      }
    })
  }
});

