var app = getApp();
var page = 1;
Page({
  data: {
    // 借阅图书
    pc_lists: [],
    departure: "请选择起点",
    destination: "终点",
    date: "请选择出发日期",
    project: [
      ['起点',
        '崂山校区',
        '鱼山校区',
        '浮山校区',
        '流亭机场',
        '火车站',
        '火车北站',
        '四方长途汽车站',
        '长途汽车站北站',
        '长途汽车站东站'
      ],
      [
        '终点',
        '崂山校区',
        '鱼山校区',
        '浮山校区',
        '流亭机场',
        '火车站',
        '火车北站',
        '四方长途汽车站',
        '长途汽车站北站',
        '长途汽车站东站'
      ]
    ],
  },

  onLoad: function() {
    // this.checkUserInfo();
    // if (app.store.libPassWord) {
    //   this.getBorrowing();
    // }
  },

  onShow: function() {
    page = 0;
    this.setData({
      departure: "请选择起点",
      destination: "终点",
      date: "请选择出发日期",
      pc_lists: [],
    })
  },
  onPullDownRefresh: function() {
    var _data = this.data;
    page = 1
    var params = {}
    if (_data.departure != "起点" && _data.departure != "请选择起点")
      params.departure = _data.departure;
    if (_data.destination != "终点")
      params.destination = _data.destination;
    if (_data.date != "请选择出发日期")
      params.date = _data.date
    params.page = page
    params.user_token = app.user_token
    var _this = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app._server + "/pc_lists",
      data: params,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function(res) {
        res = res.data
        if (res.status == "200") {
          page += 1;
          var pc_lists = res.data
          _this.setData({
            last: false,
            pc_lists: pc_lists
          })
        } else {
          _this.setData({
            last: true,
            pc_lists: []
          })
        }
        wx.stopPullDownRefresh();
      },
      fail: function(error) {
        wx.showToast({
          title: '查询失败',
          image: '/images/common/fail.png',
          duration: 2000
        });
        wx.stopPullDownRefresh();
      },
      complete: function(res) {
        wx.hideLoading();
      }
    });
  },

  onReachBottom: function() {
    var _data = this.data;
    var params = {}
    if (_data.departure != "起点" && _data.departure != "请选择起点")
      params.departure = _data.departure;
    if (_data.destination != "终点")
      params.destination = _data.destination;
    if (_data.date != "请选择出发日期")
      params.date = _data.date
    params.page = page
    params.user_token = app.user_token
    var _this = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app._server + "/pc_lists",
      data: params,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function(res) {
        res = res.data
        if (res.status == "200") {
          page += 1;
          // var pc_lists = res.data
          var pc_lists = _data.pc_lists;
          pc_lists.push.apply(pc_lists, res.data)
          _this.setData({
            last: false,
            pc_lists: pc_lists
          })
        } else {
          _this.setData({
            last: true,
          })
        }
      },
      fail: function(error) {
        wx.showToast({
          title: '查询失败',
          image: '/images/common/fail.png',
          duration: 2000
        });
      },
      complete: function(res) {
        wx.hideLoading();
      }
    });
  },

  bindMultiPickerChange: function(e) {
    page = 1;
    this.data.pc_lists = []
    var index = e.detail.value
    this.setData({
      departure: this.data.project[0][index[0]],
      destination: this.data.project[1][index[1]]
    })
    console.log(e)
  },
  bindValueChange: function(e) {
    page = 1;
    this.data.pc_lists = []
    var id = e.currentTarget.dataset.id
    var temp = {}
    temp[id] = e.detail.value
    this.setData(temp);
  },
  submit: function() {
    var _data = this.data;
    page = 1
    var params = {}
    if (_data.departure != "起点" && _data.departure != "请选择起点")
      params.departure = _data.departure;
    if (_data.destination != "终点")
      params.destination = _data.destination;
    if (_data.date != "请选择出发日期")
      params.date = _data.date
    params.page = page
    params.user_token = app.user_token
    var _this = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app._server + "/pc_lists",
      data: params,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function(res) {
        res = res.data
        if (res.status == "200") {
          page += 1;
          var pc_lists = res.data
          _this.setData({
            last: false,
            pc_lists: pc_lists
          })
        } else {
          _this.setData({
            last: true,
            pc_lists: []
          })
        }
      },
      fail: function(error) {
        wx.showToast({
          title: '查询失败',
          image: '/images/common/fail.png',
          duration: 2000
        });
      },
      complete: function(res) {
        wx.hideLoading();
      }
    });
  },
  want_pc: function() {
    wx.navigateTo({
      url: './pc',
    })
  },
  copy_wx: function(e) {
    var wx_num = (e.currentTarget.dataset.wx)
    wx.setClipboardData({
      data: wx_num,
      success: function(res) {
        wx.showToast({
          title: '微信复制成功',
        })
      }
    })
  }
});