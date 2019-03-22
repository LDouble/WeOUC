// pages/core/timetable/timetable.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    headers: [{}, {}, {}, {}, {}, {}, {}],
    month: "",
    schedules: [
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', '']
    ],
    xqs: ["夏", "秋", "春"],
    weeks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    times: [{
      time: "08:00",
      end: "08:50",
      num: 1
    }, {
      time: "09:00",
      end: "09:50",
      num: 2
    }, {
      time: "10:10",
      end: "11:00",
      num: 3
    }, {
      time: "11:10",
      end: "12:00",
      num: 4
    }, {
      time: "13:30",
      end: "14:20",
      num: 5
    }, {
      time: "14:30",
      end: "15:20",
      num: 6
    }, {
      time: "15:30",
      end: "16:20",
      num: 7
    }, {
      time: "16:30",
      end: "17:20",
      num: 8
    }, {
      time: "17:30",
      end: "18:20",
      num: 9
    }, {
      time: "18:30",
      end: "19:20",
      num: 10
    }, {
      time: "19:30",
      end: "20:20",
      num: 11
    }, {
      time: "20:30",
      end: "21:20",
      num: 12
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.week = app.week = app.week ? app.week : app.calWeek()
    this.xn = app.xn = app.xn ? app.xn : wx.getStorageSync("xn")
    this.xq = app.xq = app.xq ? app.xq : wx.getStorageSync("xq")
    var _this = this
    wx.getStorage({
      key: 'stuclass',
      success: function(res) {
        _this.stuclass = res.data
        _this.render_kb()
      },
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


  render_kb: function() {
    var stuclass = this.stuclass
    var colors = ['green', 'red', 'purple', 'yellow', "blue"];
    var schedules = [
      [{
          num: 1,
          cls: []
        },
        {
          num: 1,
          cls: []
        },
        {
          num: 1,
          cls: []
        },
        {
          num: 2,
          cls: []
        },
        {
          num: 2,
          cls: []
        },
      ],
      [{
          num: 1,
          cls: []
        },
        {
          num: 1,
          cls: []
        },
        {
          num: 1,
          cls: []
        },
        {
          num: 2,
          cls: []
        },
        {
          num: 2,
          cls: []
        },
      ],
      [{
          num: 1,
          cls: []
        },
        {
          num: 1,
          cls: []
        },
        {
          num: 1,
          cls: []
        },
        {
          num: 2,
          cls: []
        },
        {
          num: 2,
          cls: []
        },
      ],
      [{
          num: 1,
          cls: []
        },
        {
          num: 1,
          cls: []
        },
        {
          num: 1,
          cls: []
        },
        {
          num: 2,
          cls: []
        },
        {
          num: 2,
          cls: []
        },
      ],
      [{
          num: 1,
          cls: []
        },
        {
          num: 1,
          cls: []
        },
        {
          num: 1,
          cls: []
        },
        {
          num: 2,
          cls: []
        },
        {
          num: 2,
          cls: []
        },
      ],
      [{
          num: 1,
          cls: []
        },
        {
          num: 1,
          cls: []
        },
        {
          num: 1,
          cls: []
        },
        {
          num: 2,
          cls: []
        },
        {
          num: 2,
          cls: []
        },
      ],
      [{
          num: 1,
          cls: []
        },
        {
          num: 1,
          cls: []
        },
        {
          num: 1,
          cls: []
        },
        {
          num: 2,
          cls: []
        },
        {
          num: 2,
          cls: []
        },
      ],
    ]
    if (this.week < 1)
      this.week = 1
    var last_color = -1
    var tmp_colors = {}
    for (var i in stuclass) {
      var lessons = stuclass[i].classes // 第i节课里的课。
      for (var j in lessons) { // 第j天里的课
        var temp = (lessons[j])
        if (Array.isArray(temp)) {
          for (var m = 0; m < temp.length; m++) {
            var flag = false;
            if (!app.low_day && temp[m].name.indexOf("未选中") != -1 && this.xn == app.xn && this.xq == app.xq) // 大于15天，
              continue
            for (var n = 0, k = temp[m].weeks.length; n < k; n++) {
              if (this.week == temp[m].weeks[n]) {
                if (tmp_colors[temp[m].name]) {
                  var color = tmp_colors[temp[m].name] // 之前这门课已经有颜色了。
                } else {
                  var color = Math.floor(Math.random() * 10) % 5 // 随机颜色
                  if (color == last_color)
                    color = (color + 1) % 5
                  tmp_colors[temp[m].name] = color
                }
                if (i == 5) {
                  i = 4;
                }
                schedules[j][i].num = temp[m].num
                schedules[j][i].cls.push({
                  flag: true,
                  cls: temp[m],
                  classtime: temp[m].begin + "-" + (temp[m].num + temp[m].begin) + "节",
                  color: colors[color]
                })

                last_color = color;
                flag = true;
                break
              }
            }
            if (flag == false) {
              if (i == 5) {
                i = 4;
              }
              schedules[j][i].num = temp[m].num
              schedules[j][i].cls.push({
                flag: false,
                "cls": temp[m],
                classtime: temp[m].begin + "-" + (temp[m].num + temp[m].begin) + "节"
              })
            }
            if (temp[m].num > 1 && i < 4) { //三节这种特殊情况, 四节这种情况
              i = parseInt(i)
              if (i == 0 && temp[m].num == 3)
                schedules[j][i + 1].num = -1 // 上午连上四节这种情况
              else if (i == 2 && temp[m].num == 3) {
                schedules[j][i + 1].num = 0 // 5 -8 上课 //就是一上一下午的
              } else if (i == 2 && temp[m].num == 4) {
                schedules[j][i + 1].num = -1 // 5 -9 上课 //就是一上一下午的
              } else if (i == 0 && temp[m].num == 2)
                schedules[j][i + 1].num = 0 //上午连上三节,也就是第四节没课
              else if (i == 1 && temp[m].num == 2)
                schedules[j][i - 1].num = 0 // 上午连上三节,也就是第一节没课
              else if (i == 2 && temp[m].num == 2)
                schedules[j][i + 1].num = 1 // 下午5-7 上课， 然后剩下的是8 - 9
            }
            if (i == 4)
              schedules[j][i].num = 2
            if (i == 3 && schedules[j][2].num == 1) {
              schedules[j][3].num = 2;
            }
          }
        }
      }
    }
    this.initHeaders()
    var txn;
    if (this.xq == 2)
      txn = parseInt(this.xn) + 1
    else
        txn = this.xn
    this.setData({
      schedules: schedules,
      headers: this.headers,
      month: this.month,
      week: this.week,
      xn: txn,
      xq: this.xq
    })
  },
  update: function() {
    var date = new Date;
    var year = date.getFullYear();
    var itemlist = ["本学期", year+1 +"春",year + "秋", year + "夏", year + "春",
      year - 1 + "秋"
    ]
    var item = [{
        xn: app.xn,
        xq: app.xq
      },{
        xn:year,
        xq:2
      },{
        xn: year,
        xq: 1
      }, {
        xn: year,
        xq: 0
      },
      {
        xn: year - 1,
        xq: 2
      }, {
        xn: year - 1,
        xq: 1
      }
    ]
    var _this = this;
    wx.showActionSheet({
      itemList: itemlist,
      success: function(res) {
        var params = item[res.tapIndex];
        _this.xn = params.xn
        _this.xq = params.xq
        if (_this.xn == app.xn && _this.xq == app.xq) {
          _this.week = app.week
        } else {
          _this.week = 1
        }
        app.jwc = app.jwc ? app.jwc : wx.getStorageSync("jwc")
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
            _this.stuclass = stuclass;
            _this.render_kb();
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
  changeweek: function(e) {
    this.week = e.detail.value
    console.log(this.week)
    this.render_kb()
  },
  initHeaders: function() {
    if (this.xn != app.xn || this.xq != app.xq) {
      this.month = ""
      this.week = ""
      this.headers = [{
        day: "一"
      }, {
        day: "二"
      }, {
        day: "三"
      }, {
        day: "四"
      }, {
        day: "五"
      }, {
        day: "六"
      }, {
        day: "日"
      }]
    } else {
      if (this.week < 1)
        this.week = 1
      var current = this.getDate(this.week)
      this.month = current.getMonth() + 1
      this.headers = []
      for (var _i2 = 0; _i2 < 7; _i2++) {
        this.headers.push({
          day: ["日", "一", "二", "三", "四", "五", "六"][current.getDay()],
          date: current.getDate()
        });
        current.setDate(current.getDate() + 1);
      }
    }
  },
  getDate: function(week) {
    // 根据周获取日期
    app.begin_day = app.begin_day ? app.begin_day : wx.getStorageSync("begin_day")
    var date = new Date(app.begin_day) // 获取begin_day;
    date = new Date(date.getTime() + 7 * 24 * 3600000 * (week - 1)) //获取到某个的第一天的日期
    return date
  }
})