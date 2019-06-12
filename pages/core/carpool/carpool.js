// pages/core/carpool/lists.js
var app = getApp()
var params = {}
var pages = [1, 1];
var lists = [
  [],
  []
];
var current = 0
var is_bottom = [false, false]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: "请选择出发时间",
    area: ['崂山校区',
      '鱼山校区',
      '浮山校区',
      '流亭机场',
      '火车站',
      '火车北站',
      '四方长途汽车站',
      '长途汽车站北站',
      '长途汽车站东站'
    ],
    departure: "起点",
    destination: "终点",
    current: 0,
    is_bottom: [false, false]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    app.user_token = app.user_token ? app.user_token : wx.getStorageSync("user_token")
    app.carpool_agree = app.carpool_agree ? app.carpool_agree : wx.getStorageSync("carpool_agree")
    if (!app.carpool_agree)
        wx.redirectTo({
          url: 'disclaimer',
        })
    if (app.user_token)
      params['user_token'] = app.user_token
    else
      wx.redirectTo({
        url: '/pages/login/login',
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
    lists = [[],[]]
    pages = [1, 1];
    is_bottom = [false, false]
    this.setData({
      lists:lists
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
    is_bottom[current] = false
    lists[current] = []
    this.setData({
      is_bottom: is_bottom,
      lists:lists
    })
    this.get_data(true)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (is_bottom[current] == true)
      return
    this.get_data()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  select: function(e) {
    var key = e.currentTarget.dataset.id
    var value = e.detail.value
    if (key == "departure" || key == "destination")
      params[key] = this.data.area[value]
    else
      params[key] = value;
    this.setData(params)
  },
  search: function(e) {
    var formid = e.detail.formid;
    app.add_formid(formid);
    pages[current] = 1
    lists[current] = []
    this.get_data()
  },
  get_data(refresh = false) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    if (refresh == true) {
      pages[current] = 1
      lists[current] = []
    }
    params.page = pages[current]
    params.mode = current
    wx.request({
      url: app.server + '/pc_lists',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: params,
      success: function(res) {
        if (res.data.data && res.data.data.length > 0) {
          lists[current] = lists[current].concat(res.data.data)
          that.setData({
            lists: lists
          })
          pages[current] += 1
        } else {
          is_bottom[current] = true
          that.setData({
            is_bottom: is_bottom,
            lists: lists
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
  },
  move: function(e) {
    var key = e.currentTarget.dataset.id
    current = key
    this.setData({
      current: key
    })
    if (lists[current].length == 0) {
      this.get_data()
    }
  },
  delete: function(e) {
    var id = e.currentTarget.dataset.id;
    console.log(e)
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    wx.request({
      url: app.server + '/pc_delete',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        user_token: app.user_token,
        id: id
      },
      success: function(res) {
        wx.hideLoading()
        wx.showToast({
          title: '删除成功',
        })
        lists = [[], []]
        pages = [1, 1];
        setTimeout(function() {
          that.get_data(true)
        }, 2000)
      },
      fail: function(err) {
        wx.hideLoading()
        wx.showToast({
          title: '删除失败',
        })
      },
      complete: function(res) {}
    })
  },
  copy: function(e){
    var value = e.currentTarget.dataset.wx
    wx.setClipboardData({
      data: value,
      success:function(e){
        wx.showToast({
          title: '复制微信号成功',
        })
      }
    })
  }
})