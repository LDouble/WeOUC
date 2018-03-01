// pages/core/cjfx/cjfx.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  'remind':"加载中",
  'rank':0,
  'all':0,
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
    var ok = wx.getStorageSync("ok")
    var _this = this
    if(ok == 1)
      this.getkscjfx()
    else{
      wx.showModal({
        title: '授权提示',
        content: '由于成绩分析以及排名需要使用你的成绩，成绩只会由程序进行处理，并且加密存储，任何人无法接触。是否授权?',
        success: function (res) {
          if (res.confirm) {
            wx.setStorage({
              key: 'ok',
              data: 1,
            })
            _this.getkscjfx()
          } else if (res.cancel) {
            wx.navigateBack()
                     }
        }
      })
    }
    },

  getkscjfx: function () {
    var _this = this;
    wx.showNavigationBarLoading();
    wx.request({
      url: app._server + "/oucjw/getRank",
      method: 'POST',
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      data: {
        username: app.username,
        password: app.password,
        token: app.token
      },
      success: function (res) {
        if (res.data.status == 200) {
          _this.setData({
            rank:res.data.rank,
            total:res.data.total,
            averAll:res.data.averAll,
            remind:""
          })
          var cate = [];
          var data = [];
          var aver = JSON.parse(res.data.aver);
          for (var p in aver) {
            if(p != "all"){
              data.push(aver[p])
              cate.push(p)
            }
             }
          _this.create(cate,data)   

        } else {
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
        //console.warn('网络错误');
      },
      complete: function () {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },
  create:function(category,data){
    new this.wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      categories: category,
      series: [{
        data: data,
        format: function (val) {
          return val.toFixed(2) + '分';
        }
      }],
      yAxis: {
        title: '加权分',
        format: function (val) {
          return val.toFixed(2);
        },
        min: 0
      },
      width: 320,
      height: 180,
      dataLabel: true,
      dataPointShape: true,
      xAxis: {
        disableGrid: false
      },
    });
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
        this.getkscjfx();
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
  wxCharts: require('wxcharts-min.js')

})