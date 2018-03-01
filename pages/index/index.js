//index.js
//获取应用实例
var app = getApp();
Page({
  data: {
    offline: false,
    remind: '加载中',
    nothingclass: false,
    stuclass: null,
    pushdata: null,
    classtime: [
      { '1 - 2 节': '08:00 - 09:50' },
      { '3 - 4 节': '10:20 - 12:00' },
      { '5 - 6 节': '13:30 - 15:20' },
      { '7 - 8 节': '15:30 - 17:20' },
      { '9 - 10 节': '18:30 - 16:50' },
      { '11 - 12 节': '17:00 - 18:20' },
      { '13 - 14 节': '19:00 - 20:20' },
      { '15 - 16 节': '20:30 - 21:50' },
    ],
    core: [
      { id: 'kb', name: '秋季课表', disabled: true, teacher_disabled: false, offline_disabled: true },
      { id: 'cj', name: '成绩查询', disabled: false, teacher_disabled: true, offline_disabled: false },
      { id: 'ks', name: '考试安排', disabled: false, teacher_disabled: true, offline_disabled: true },
      { id: 'kjs', name: '空教室', disabled: false, teacher_disabled: true, offline_disabled: false },
      { id: 'sdf', name: '电量查询', disabled: false, teacher_disabled: true, offline_disabled: false },
<<<<<<< HEAD
      { id: 'cjfx', name: '成绩分析', disabled: false, teacher_disabled: true, offline_disabled: false },
=======
      { id: 'chat', name: '成绩通知', disabled: false, teacher_disabled: true, offline_disabled: false },
>>>>>>> a0048c0f82e83528696b9cc8ee81ea5b12f1e8e8
    ],
    card: {
      'kb': {
        show: false,
        time_list: [
          { begin: '8:00', end: '8:45' },
          { begin: '8:55', end: '9:40' },
          { begin: '10:05', end: '10:50' },
          { begin: '11:00', end: '11:45' },
          { begin: '14:00', end: '14:45' },
          { begin: '14:55', end: '15:40' },
          { begin: '16:05', end: '16:50' },
          { begin: '17:00', end: '17:45' },
          { begin: '19:00', end: '19:45' },
          { begin: '19:55', end: '20:40' },
          { begin: '20:50', end: '21:35' },
          { begin: '21:45', end: '22:30' }
        ],
        data: {}
      },
      'ykt': {
        show: false,
        data: {
          'last_time': '',
          'balance': 0,
          'cost_status': false,
          'today_cost': {
            value: [],
            total: 0
          }
        }
      },
      'jy': {
        show: false,
        data: {}
      },
      'sdf': {
        show: false,
        data: {
          'room': '',
          'record_time': '',
          'cost': 0,
          'spend': 0
        }
      }
    },
    user: {},
    disabledItemTap: false //点击了不可用的页面
  },
  //分享
  onShareAppMessage: function () {
    return {
      title: 'We海大',
      desc: '碎片化、一站式、一体化校园移动门户',
      path: '/pages/index/index'
    };
  },
  //下拉更新
  onPullDownRefresh: function () {
    var _this = this;
    if (wx.getStorageSync('stuclass') == '') {
      //重定向
      _this.setData({ remind: '加载中' });
      _this.setData({
        'user': {
          'is_bind': true
        }
      });
      this.getStuclass(1);
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      });
    }
    else {
      _this.setData({ remind: '加载中' });
      _this.setData({
        'user': {
          'is_bind': true
        }
      });
      this.getStuclass(1);
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      });
    }
  },
  onShow: function () {
    var _this = this;
    if (app.token) { //展示时，来判断是否绑定
      _this.setData({ remind: '加载中' });
      var stuclass =  wx.getStorageSync('stuclass')
      if (stuclass== '')
       _this.getStuclass(1); //获取成绩信息
      else
       // _this.getStuclass(1); //获取成绩信息
        _this.getTodayclass(stuclass)
      _this.setData({
        'user': {
          'is_bind': true
        }
      });
    }
    else {
      _this.setData({
        'user': {
          'is_bind': false
        }
      });
    }
  },
  onReady: function () {
  },
  getTodayclass: function (stuclass) {
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
        if (todaydata == undefined ){
          noclassnum++;
          continue;
        }
        arrayweek = todaydata.weeks;
        strTem[value] = {};
        if (app.in_array(arrayweek)) {
          try {
            strTem[value].class = todaydata;
            var classtime = todaydata.begin + "-" + (todaydata.num+todaydata.begin) +"节";
            strTem[value].classtime = classtime;
          }
          catch (err) {
            _this.getStuclass();
          }
        }
        else {
          noclassnum++;
          strTem[value] = undefined
          continue;
        }
      };
    //如果没课的数量是8节那么当天没课
      var flag = false;
      for(var x in strTem){
        var stemp = strTem[x];
        if (stemp != undefined){
          flag = true;
          break;
        }
      }
      console.log("flag")
      console.log(flag)
      if(!flag) 
      _this.setData({ nothingclass: true });
    _this.setData({ stuclass: strTem });
    _this.setData({
      'remind': ''
    });
  },
  //获取课程信息
  getStuclass: function (options) {
    var _this = this;
    wx.showNavigationBarLoading
    wx.request({
      url: app._server + '/oucjw/kb',
      method:"POST",
      data:{
        token:app.token,
        username: app.username,
        password: app.password,
        update:options,
        xn: "2017",
        xq: "1"
      },
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      success: function (res) {
        if (res.data.status < 40000) {
          app.today = parseInt(new Date().getDay());
          var today = app.today;
          var stuclass = res.data.data;
          wx.setStorageSync('stuclass', stuclass);
          _this.getTodayclass(stuclass);
        }
      },
      fail: function () {
        app.showErrorModal("服务器连接失败", "请检查网络连接")
      },
      complete: function () {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    })
  },

  onLoad: function () {
      app.token = wx.getStorageSync('token');
      if(!app.token)
        this.login();
  },
  login: function () {
    var _this = this;
    app.getUser(function (status) {
      _this.response.call(_this, status);
    });
  },
  response: function (status) {
    var _this = this;
    console.log(status)
    if (status) {
      if (status == "已绑定") {
        //错误
        app._user.is_bind = true;
        _this.setData({
         'remind':""
        });
        _this.setData({
          'user': {
            'is_bind': true
          }
        });
        this.getStuclass()
        app.getStuinfo()
      } else if(status == "未授权"){
        _this.setData({
          'remind': "未授权"
        });
      }
      else {
        app._user.is_bind = false;
        _this.setData({
          'user': {
            'is_bind': false
          }
        });
        wx.redirectTo({
          url: '/pages/more/login',
        })
      }
    }else{
      wx.redirectTo({
        url: '/pages/more/login',
      })
    }
  },
  disabled_item: function () {
    var _this = this;
    if (!_this.data.disabledItemTap) {
      _this.setData({
        disabledItemTap: true
      });
      setTimeout(function () {
        _this.setData({
          disabledItemTap: false
        });
      }, 2000);
    }
  },
  auth:function(userinfo){
    if (userinfo.detail.errMsg == "getUserInfo:fail auth deny")
      app.showErrorModal("我们需要使用你的头像以及微信id进行绑定，请同意授权！","授权失败")
    else{
      app.g_status=""
      this.login()
    }

  }
});
