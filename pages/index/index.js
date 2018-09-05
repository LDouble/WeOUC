// pages/index/index.js
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    plain: true,
    "core": [{
        id: 'kb',
        name: '课表',
        require: "jwc",
      },
      {
        id: 'cj',
        name: '成绩',
        require: "jwc",
      },
      {
        id: 'cjfx',
        name: '成绩分析',
        require: "jwc",
      },
      {
        id: 'ks',
        name: '考场',
        require: "jwc",
      },
      {
        id: 'cls',
        name: '自习室',
        require: "",
      },
      // {
      //   id: 'ck',
      //   name: '蹭课',
      //   require: "",
      // },
      {
        id: 'df',
        name: '电量',
        require: "xh"
      },
      {
        id: 'pcs',
        name: '拼车',
        require: "xh"
      }
    ],
    "swiper_height": 200,
    "notices": [{
      url: "https://mp.weixin.qq.com/s/_NMmkQSgxDvu1MPmC4f3_g",
      pic: "https://lg-mq3kp55s-1253895749.cos.ap-shanghai.myqcloud.com/slide.jpg"
    }],
    nothingclass: 1,
    remind: "加载中" //未绑定，未授权，加载中
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var data = {
      "remind": app.remind,
      "offline": app.offline
    }
    this.setData(data)
    var that = this
    if (app.offline == false) {
      wx.showLoading({
        title: '加载中',
      })
      wx.request({
        url: app._server + "/config",
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
      this.init()
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
    app.id = wx.getStorageSync("id"); //获取学号和密码
    app.slide = app.slide || wx.getStorageSync("slides")
  },

  init: function(data = undefined) {
    var that = this;
    if(new Date() < new Date("2018-10-15")) // 15号之前不确定，所以不缓存
      wx.removeStorageSync("stuclass");
    if (data != undefined) {
      /*
      获取到服务器的版本后，初始化完毕
      然后到index进行判断是否为新版本，如果是新版本，则清空缓存重新获取信息。
     */
      that.kb_version = data.version;
      that.slides = data.slides;
      if (that.kb_version != wx.getStorageSync("kb_version")) {
        wx.removeStorageSync("stuclass"); //清空stuclass，重新进行绑定。
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
        this.getTodayclass(stuclass)
      }
    }
    this.setData({
      "notices": this.slides
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    if (this.data.pull)
      return
    if (!app.jwc) {
      wx.stopPullDownRefresh()
      return
    } else {
      this.data.pull = true;
      this.getStuclass()
    }
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
  /* 通知调转*/
  noticeTo: function(e) {
    // console.log(e.target.dataset.id)
    wx.navigateTo({
      url: '/pages/more/web/view?url=' + e.target.dataset.id,
    })
  },
  submit: function(e) {
    // console.log(e)
    var id = e.detail.target.dataset.id //要去的地方。
    var req = e.detail.target.dataset.require; //需要的权限
    var content = ""
    var url = ""
    if (req == "jwc" && !app.jwc) {
      content = "请先绑定教务处"
    } else if (req == "id" && !app.id) {
      content = "请先绑定信息门户"
    } else if (req == "xh" && !app.xh) {
      content = "请先绑定账号"
    } else if (id == "pcs") {
      wx.showModal({
        title: '免责声明',
        content: '拼车功能旨在为大家提供方便，任何用户在使用时候都需要遵守中国法律，虾米提醒你，WeOUC+中信息均为用户自行发布，在同意拼车前，各自需要对另一方的情况进行调查、判断、核实，例如智能卡验证。WeOUC+不能对任何人提供任何形式的安全担保，一旦发生侵犯人身安全的事件，WeOUC+不承担任何责任。请大家注重保护个人隐私，用户发表的信息、内容违反法律规定，或侵犯他人合法权益的，由内容提供方承担法律责任，WeOUC+不承担任何责任。',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/core/' + id + "/" + id,
            })
            wx.request({
              url: app._server + "/add_formid",
              data: {
                user_token: app.user_token,
                formid: e.detail.formId
              },
              method: "POST",
              header: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            });
          }else{
            return
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/core/' + id + "/" + id,
      })
      wx.request({
        url: app._server + "/add_formid",
        data: {
          user_token: app.user_token,
          formid: e.detail.formId
        },
        method: "POST",
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    }
    if (content != "") {
      wx.showModal({
        title: '绑定提示',
        content: content,
        confirmText: "去绑定",
      })
    }
  },

  /*授权、登陆操作 */
  auth: function(e) {
    // wx.showActionSheet({
    //   itemList: ["使用本科选课系统登陆", "使用信息门户登陆",],
    // })
    var type = "jwc"
    wx.navigateTo({
      url: '/pages/more/bind?type=' + type,
    })
  },
  //获取课程信息
  getStuclass: function(options) {
    var _this = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app._server + "/kb",
      data: app.jwc,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function(res) {
        res = res.data
        app.today = parseInt(new Date().getDay());
        var today = app.today;
        var stuclass = res.data;
        wx.setStorageSync('stuclass', stuclass);
        _this.getTodayclass(stuclass);
        if (_this.data.pull) {
          _this.data.pull = false
          wx.stopPullDownRefresh()
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
  getTodayclass: function(stuclass) {
    var _this = this;
    app.today = parseInt(new Date().getDay());
    var today = app.today - 1;
    var noclassnum = 0;
    var strTem = {};
    for (var value in stuclass) {
      var todaydata = stuclass[value].classes[today];
      try {
        if (Array.isArray(todaydata)) {
          var i = 0;
          for (i; i < todaydata.length; i++) {
            if (app.in_array(todaydata[i].weeks)) {
              break;
            }
          }
          todaydata = todaydata[i];
        }
      } catch (err) {
        this.getStuclass();
      }
      var arrayweek = [];
      if (todaydata == undefined) {
        noclassnum++;
        continue;
      }
      arrayweek = todaydata.weeks;
      strTem[value] = {};
      if (app.in_array(arrayweek)) {
        try {
          strTem[value].class = todaydata;
          var classtime = todaydata.begin + "-" + (todaydata.num + todaydata.begin) + "节";
          strTem[value].classtime = classtime;
        } catch (err) {
          _this.getStuclass();
        }
      } else {
        noclassnum++;
        strTem[value] = undefined
        continue;
      }
    }; //如果没课的数量是8节那么当天没课
    var flag = true;
    for (var x in strTem) {
      var stemp = strTem[x];
      //  console.log(stemp)
      if (stemp != undefined) {
        flag = false;
        break;
      }
    }
    //  console.log("flag")
    //   console.log(flag)
    _this.setData({
      nothingclass: flag
    });
    _this.setData({
      stuclass: strTem
    });
    _this.setData({
      'remind': ''
    });
  },
})