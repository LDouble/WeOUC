// pages/core/timetable/timetable.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //tabList: ['周一', "周二", "周三", "周四", "周五", "周六", "周日"],
    tabList: [{
        label: '周一',
        id: 'Mon',
        name: 'Mon'
      }, {
        label: '周二',
        id: 'Tues',
        name: 'Tues'
      }, {
        label: '周三',
        id: 'Wed',
        name: 'Wed'
      },
      {
        label: '周四',
        id: 'Thurs',
        name: 'Thurs'
      }, {
        label: '周五',
        id: 'Fri',
        name: 'Fri'
      }, {
        label: '周六',
        id: 'Sat',
        name: 'Sat'
      }, {
        label: '周日',
        id: 'Sun',
        name: 'Sun'
      }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var stuclass = wx.getStorageSync("stuclass")
    if (stuclass) {
      this.render_kb(stuclass)
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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
  render_kb: function(stuclass) {
    var cls = [
      [],
      [],
      [],
      [],
      [],
      [],
      []
    ]
    for (var i in stuclass) {
      var lessons = stuclass[i].classes // 第i节课里的课。
      for (var j in lessons) { // 第j天里的课
        var temp = (lessons[j])
        if (Array.isArray(temp)) {
          for (var m = 0; m < temp.length; m++) {
            var flag = false;
            for (var n = 0, k = temp[m].weeks.length; n < k; n++) {
              if (app.week == temp[m].weeks[n]) {
                cls[j].push({
                  flag: true,
                  cls: temp[m],
                  classtime: temp[m].begin + "-" + (temp[m].num + temp[m].begin) + "节"
                })
                flag = true;
                break
              }
            }
            if (flag == false)
              cls[j].push({
                flag: false,
                "cls": temp[m],
                classtime: temp[m].begin + "-" + (temp[m].num + temp[m].begin) + "节"
              })
          }
        }
      }
    }
    this.setData({
      "course": cls
    })
    var day = new Date().getDay()
    if (day == 0)
      day = 6
    else
      day -= 1
    this.setData({
      day: day,
      week: app.week
    })
  },
  update: function() {
    var date = new Date;
    var year = date.getFullYear();
    var itemlist = ["本学期", year - 1 + "夏", year - 1 + "秋", year + "春", year + "夏", year + "秋"]
    var item = [{}, {
        xn: year - 1,
        xq: 0
      }, {
        xn: year - 1,
        xq: 1
      },
      {
        xn: year - 1,
        xq: 2
      }, {
        xn: year,
        xq: 0
      }, {
        xn: year,
        xq: 1
      },
    ]
    var _this = this;
    wx.showActionSheet({
      itemList: itemlist,
      success: function(res) {
        var params = item[res.tapIndex];
        params.xh = app.jwc.xh
        params.password = app.jwc.password
        wx.showLoading({
          title: '加载中',
        })
        wx.request({
          url: app.server + "/kb",
          data: params,
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          method: "POST",
          success: function(res) {
            res = res.data
            var stuclass = res.data;
            if (params.xn == undefined)
              wx.setStorageSync('stuclass', stuclass);
            _this.render_kb(stuclass);
          },
          fail: function(error) {
            console.log(error)
          },
          complete: function(res) {
            wx.hideLoading();
          }
        });
      }
    })
  },
  answer: function() {
    this.data.dialog.toggle();
  }
})