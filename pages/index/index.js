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
        id: 'ks',
        name: '考场',
        require: "jwc",
      },
      {
        id: 'kjs',
        name: '空教室',
        disabled: false,
        teacher_disabled: true,
        offline_disabled: false
      },
      {
        id: 'df',
        name: '电量查询',
        disabled: true,
        teacher_disabled: true,
        offline_disabled: false
      },
      {
        id: 'cjfx',
        name: '成绩分析',
        disabled: true,
        teacher_disabled: true,
        offline_disabled: false
      }
    ],
    "swiper_height": 200,
    "notices": [{
      id: "1",
      cover: "https://u-dl.fotor.com.cn/uid_0c94e8f3382e4db4b4f8f0300eff6063o/b439c810-6ae9-11e8-91cb-8d4b06811576/%E6%9C%AA%E5%91%BD%E5%90%8D%E8%AE%BE%E8%AE%A1.jpg?0.18393008301041913"
    }],
    nothingclass: 1,
    remind: "加载中" //未绑定，未授权，加载中
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    app.xh = wx.getStorageSync("xh");
    app.jwc = wx.getStorageSync("jwc");
    app.id = wx.getStorageSync("id"); //获取学号和密码
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
    this.setData({
      "remind": app.remind,
      "offline": app.offline
    })
    var stuclass = wx.getStorageSync("stuclass");
    if (stuclass == "") {
      this.getStuclass(1)
    } else {
      this.getTodayclass(stuclass)
    }
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
  /* 通知调转*/
  noticeTo: function(e) {
    console.log(e.target.dataset.id)
  },
  submit: function(e) {
    var id = e.detail.target.dataset.id //要去的地方。
    var req = e.detail.target.dataset.require; //需要的权限
    if (req == "jwc" && !app.jwc) {
      content = "请先绑定教务处"
    } else if (req == "id" && !app.id) {
      content = "请先绑定信息门户"
    }
    wx.navigateTo({
      url: '/pages/core/' + id + "/" + id,
    })
  },

  /*授权、登陆操作 */
  auth: function(e) {
    // wx.showActionSheet({
    //   itemList: ["使用本科选课系统登陆", "使用信息门户登陆",],
    // })
    var type = "jwc"
    wx.redirectTo({
      url: '/pages/more/bind?type=' + type,
    })
  },
  //获取课程信息
  getStuclass: function(options) {
    var _this = this;
    app.http.post({
      url: app._server + "/kb",
      params: app.jwc
    }).then((res) => {
      app.today = parseInt(new Date().getDay());
      var today = app.today;
      var stuclass = res.data;
      wx.setStorageSync('stuclass', stuclass);
      _this.getTodayclass(stuclass);
      console.log(1)
    }).catch((error) => {
      console.log(error)
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
      console.log(stemp)
      if (stemp != undefined) {
        flag = false;
        break;
      }
    }
    console.log("flag")
    console.log(flag)
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