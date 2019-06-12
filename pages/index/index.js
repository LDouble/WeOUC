//index.js
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    "swiper_height": 200,
    "notices": [{
      url: "https://mp.weixin.qq.com/s/_NMmkQSgxDvu1MPmC4f3_g",
      pic: "https://lg-mq3kp55s-1253895749.cos.ap-shanghai.myqcloud.com/stop.jpg"
    }],
    "navs": [
      {
        key: "xk_result",
        desc: "选课结果",
        verify: "jwc"
      },{
        key: "timetable",
        desc: "课表",
        verify: "jwc"
      },
      {
        key: "score",
        desc: "成绩",
        verify: "jwc"
      }, {
        key: "test",
        desc: "考场",
        verify: "jwc"
      }, {
        key: "room",
        desc: "自习室",
        verify: ""
      }, {
        key: "course",
        desc: "蹭课",
        verify: ""
      },
      {
        key: "carpool",
        desc: "拼车",
        verify: "jwc"
      }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if(wx.cloud){
      wx.cloud.init({
        env: 'develop-b907d7'
      })
      const db = wx.cloud.database()
      db.collection('news').get().then(res => {
        var a = new Array("日", "一", "二", "三", "四", "五", "六");
        var week = new Date().getDay();
        var str = "周" + a[week];
        this.setData({
          "title": res.data[0].title,
          "url": res.data[0].url,
          'week': str,
          'week_index': week,
        })
      })
    }
    var that = this
    this.setData({
      "remind": app.remind,
      "offline": app.offline,
    })
    if (app.offline == false && app.sildes == undefined) {
      wx.showLoading({
        title: '加载中',
      })
      wx.request({
        url: app.server + "/config",
        data: {},
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: "GET",
        success: function(res) {
          that.init(res.data);
        },
        fail: function(error) {
          console.log(error)
          that.init()
        },
        complete: function(res) {
          wx.hideLoading();
        }
      })
    } else {
      wx.setData({
        notices: app.slides
      })
    }
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
    app.xh = wx.getStorageSync("xh");
    app.name = wx.getStorageSync("name")
    app.jwc = wx.getStorageSync("jwc");
    app.user_token = app.user_token ? app.user_token : wx.getStorageSync("user_token")
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
    if (app.user_token) {
      this.data.pull = true
      this.getStuclass()
    } else
      wx.stopPullDownRefresh();
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
  init: function(data = undefined) {
    var that = this;
    var not_flag = wx.getStorageSync("not_flag");
    if (app.low_day && (not_flag == false)) {
      // 开学前半个月不使用缓存
      wx.removeStorageSync("stuclass");
    }

    if (data != undefined) {
      /*
      获取到服务器的版本后，初始化完毕
      然后到index进行判断是否为新版本，如果是新版本，则清空缓存重新获取信息。
     */
      that.kb_version = data.version;
      that.slides = data.slides;
      if (that.kb_version != wx.getStorageSync("kb_version")) {
        wx.removeStorageSync("stuclass"); //清空stuclass，重新进行课表获取。
        wx.setStorageSync("kb_version", that.kb_version);
      }
      wx.setStorageSync("slides", that.slides);
    } else {
      that.kb_version = wx.getStorageSync("kb_version")
      that.slides = wx.getStorageSync("slides")
    }
    if (app.user_token) {
      var stuclass = wx.getStorageSync("stuclass");
      if (stuclass == "" && app.offline == false) {
        this.getStuclass(1)
      } else {
        this.getTodayClass(stuclass)
      }
    }
    this.setData({
      "notices": this.slides
    })
  },
  /*跳转到登陆界面，待完善研究生登陆*/
  auth: function() {
    var type = "jwc"
    wx.navigateTo({
      url: '/pages/login/login?type=' + type,
    })
  },
  /* 获取课程表 */
  getStuclass: function(options) {
    var _this = this;
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      "remind": "update"
    })
    wx.request({
      url: app.server + "/kb",
      data: app.jwc,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function(res) {
        if (res.data.status == "402") {
          wx.showModal({
            title: '密码错误',
            content: "你或许在教务系统中修改了密码，请重新绑定",
            showCancel: false,
            success: function(res) {
              wx.clearStorageSync();
              app.user_token = ""
              app.xh = "",
                app.remind = "unauth"
              wx.setStorageSync("version", app.version)
              wx.reLaunch({
                url: '/pages/login/login',
              })
            }
          })
        }
        res = res.data
        var stuclass = res.data;
        wx.setStorageSync('stuclass', stuclass); // 缓存到本地
        wx.setStorageSync("not_flag", !res.flag)
        _this.getTodayClass(stuclass);
        if (_this.data.pull) {
          _this.data.pull = false
          wx.stopPullDownRefresh()
          app.remind = ""
        }
      },
      fail: function(error) {
        if (_this.data.pull) {
          _this.data.pull = false
          wx.stopPullDownRefresh()
        }
      },
      complete: function(res) {
        wx.hideLoading();
      }
    })
  },
  /* 获取今天要上的有哪些课 */
  getTodayClass: function(stuclass) {
    app.today = parseInt(new Date().getDay());
    var today;
    if (app.today == 0) {
      app.today = 6
      today = 6;
    } else
      today = app.today - 1 //数组从0开始的，
    var todays = []
    for (var cls in stuclass) { // 先遍历节
      var today_class = stuclass[cls].classes[today]
      if (Array.isArray(today_class)) // 如果是数组的话,那就是有课
      {
        var flag = false
        for (var i = 0; i < today_class.length; i++) {
          for (var j = 0, k = today_class[i].weeks.length; j < k; j++) {
            if (app.week == today_class[i].weeks[j]) {
              flag = true;
              break
            }
          }
          if (flag == true) { // 说明是该周的课，记录下来，break
            if (!app.low_day && today_class[i].name.indexOf("未选中") != -1) // 大于15天，
              continue
            var todaydata = today_class[i]; // 找到这门课了
            todays.push({
              cls: todaydata,
              classtime: todaydata.begin + "-" + (todaydata.num + todaydata.begin) + "节"
            })
            break
          }
        }
      }
    }
    console.log(todays.length)
    if (todays.length == 0) {
      this.setData({
        remind: "你今天没有课哦"
      })
    } else {
      this.setData({
        courses: todays,
        remind: ""
      })
    }
  },
  navigatetokb: function() {
    wx.navigateTo({
      url: '/pages/core/timetable/timetable',
    })
  },
  submit: function(e) {
    var key = e.detail.target.dataset.key //要去的地方。
    var verify = e.detail.target.dataset.verify; //需要的权限
    var content = ""
    var url = ""
    console.log(verify)
    if (verify == "jwc" && !app.jwc) {
      content = "请先绑定教务处"
    } else if (verify == "id" && !app.id) {
      content = "请先绑定信息门户"
    } else if (verify == "xh" && !app.xh) {
      content = "请先绑定账号"
    } else {
      wx.navigateTo({
        url: '/pages/core/' + key + "/" + key,
      })
      app.add_formid(e.detail.formId)
    }
    if (content != "") {
      wx.showModal({
        title: '绑定提示',
        content: content,
        confirmText: "去绑定",
      })
    }
  },
  noticeTo: function(e) {
    console.log(e)
    wx.navigateTo({
      url: '/pages/web/web?url=' + e.target.dataset.id,
    })
  },
})