// pages/core/carpool/add.js
var app = getApp()
var params = {}

Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    departure: "请选择起点",
    destination: "请选择终点",
    date: "请选择起点出发日期",
    time: "请选择起点出发时间",
    vehicle_time: "请选择航班/车次时间",
    disable:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    app.user_token = app.user_token ? app.user_token : wx.getStorageSync("user_token")
    if (app.user_token)
      params['user_token'] = app.user_token
    else
      wx.redirectTo({
        url: '/pages/login/login',
      })
  },
  select: function(e) {
    var key = e.currentTarget.dataset.id
    var value = e.detail.value
    if (key == "destination" || key == "departure")
      params[key] = this.data.area[value]
    else
      params[key] = value
    this.setData(params)
  },
  input: function(e) {
    var key = e.currentTarget.dataset.id
    var value = e.detail.value
    params[key] = value
    this.setData(params)
  },
  formSubmit: function(e) {
    this.setData({
      disabled: false
    })
    wx.showLoading({
      title: '提交中',
    })
    params['note'] = e.detail.value.note
    var formid = e.detail.formId
    app.add_formid(formid)
    if (!this.check()){
      this.setData({
        disabled: true
      })
      wx.hideLoading()
      return
    }
    var that = this
    wx.request({
      url: app.server + "/pc",
      data: params,
      method: "POST",
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if (res.data.status == 200) {
          wx.hideLoading()
          wx.showModal({
            title: '提交成功',
            content: '你的拼车需求已提交，请耐心等待联系',
            showCancel: false,
            success: function(e) {
              if (e.confirm) {
                wx.navigateBack({

                })
              }
            }
          })
        }
      },
      complete: function(){
        wx.hideLoading()
      }
    });
  },
  check() {
    if (params.departure == undefined) {
      wx.showToast({
        title: '请选择起点',
        icon: "none",
      })
      return false
    } else if (params.destination == undefined) {
      wx.showToast({
        title: '请选择终点',
        icon: "none",
      })
      return false
    } else if (params.date == undefined) {
      wx.showToast({
        title: '请选择出发日期',
        icon: "none",
      })
      return false
    } else if (params.time == undefined) {
      wx.showToast({
        title: '请选择出发时间',
        icon: "none",
      })
      return false
    } else if (params.wx == undefined || params.wx == "") {
      wx.showToast({
        title: '请输入微信号',
        icon: "none",
      })
      return false
    } else if (params.departure == params.destination) {
      wx.showToast({
        title: '起点终点不正确  ',
        icon: "none",
      })
      return false
    } else
      return true
  }
})