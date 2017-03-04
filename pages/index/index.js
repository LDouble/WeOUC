//index.js
//获取应用实例
var app = getApp();
Page({
  data: {
    offline: false,
    remind: '加载中',
    nothingclass: false,
    stuclass: null,
    classtime: [
      { '1 - 2 节': '09:00 - 10:20' },
      { '3 - 4 节': '10:40 - 12:00' },
      { '5 - 6 节': '12:30 - 13:50' },
      { '7 - 8 节': '14:00 - 15:20' },
      { '9 - 10 节': '15:30 - 16:50' },
      { '11 - 12 节': '17:00 - 18:20' },
      { '13 - 14 节': '19:00 - 20:20' },
      { '15 - 16 节': '20:30 - 21:50' },
    ],
    core: [
      { id: 'kb', name: '课表查询', disabled: true, teacher_disabled: false, offline_disabled: true },
      { id: 'cj', name: '成绩查询', disabled: false, teacher_disabled: true, offline_disabled: false },
      { id: 'bx', name: '考勤信息', disabled: false, teacher_disabled: false, offline_disabled: true }
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
      title: 'We华软',
      desc: '碎片化、一站式、一体化校园移动门户',
      path: '/pages/index/index'
    };
  },
  //下拉更新
  onPullDownRefresh: function () {
    
      //this.getCardData();
      
      if (wx.getStorageSync('stuclass') === '') {
      console.log("onshow stuclass获取的缓存为空");
      //重定向
      _this.setData({remind:'加载中'});
       _this.setData({'user': {
        'is_bind': true
      }});
      this.getStuclass();
     
    }

       wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      });
      wx.stopPullDownRefresh();  
  },
  onShow: function () {
    var _this = this;
    if (app.openid === ''||app.openid ===null) {
      console.log("onshow openid获取的缓存为空");
      wx.navigateTo({
        url: '/pages/more/login'
      });
    }
    if (wx.getStorageSync('stuclass') === '') {
      console.log("onshow stuclass获取的缓存为空");
      //重定向
      _this.setData({remind:'加载中'});
       _this.setData({'user': {
        'is_bind': true
      }});
      this.getStuclass();
     
    }
    else {
      stuclass = wx.getStorageSync('stuclass')
      var stuclass = JSON.parse(stuclass);
      console.log(stuclass);
       _this.setData({'user': {
        'is_bind': true
      }});
      _this.getTodayclass(stuclass);
      
    }
    console.log("index onshow");
    app._user.is_bind = true;

  },
  onReady: function () {

  },
  getTodayclass: function (stuclass) {
    var _this=this;
    wx.showNavigationBarLoading();
    app.today = parseInt(new Date().getDay());
    //这个today是数组下标，所以减一
    var today = app.today-1;
    console.log("目前星期：" + app.today);
    console.log(stuclass)
    var strTem = {};  // 临时变量
      for (var value in stuclass) {
        if(stuclass[value].classes[today]==null){
          _this.setData({ nothingclass: true });
          break;
        }
        var todaydata = stuclass[value].classes[today];
        console.log(todaydata);
        var arrayweek = [];
        arrayweek = todaydata.weeks;
        console.log('arrayweek的值'+arrayweek);
        strTem[value] = {};
        if (app.in_array(arrayweek)) {
          strTem[value].class = stuclass[value].classes[today];
          strTem[value].classtime = stuclass[value].time;
        }
        else{
          continue;
        }
      };
      _this.setData({ stuclass: strTem });
      _this.setData({
        'remind': ''
      });
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
  },
  getStuclass: function () {
    var _this = this;
    wx.request({
      url: app._server + '/mywebapp/kebiao?openid=' + app.openid,
      success: function (res) {
        if (res.data[0].status < 40000) {
          
          app.today = parseInt(new Date().getDay());
          var today = app.today;
          var stuclass = JSON.parse(res.data[0].data);
          wx.setStorageSync('stuclass', stuclass.allClass);
          wx.setStorageSync('week', stuclass.week);
          _this.getTodayclass(JSON.parse(stuclass.allClass));
        }
      },
      fail: function () {
        app.showErrorModal("服务器连接失败", "请检查网络连接")
      },
      complete:function(){
        wx.hideNavigationBarLoading();
      }
    })
  },
  onLoad: function () {
    app.openid = wx.getStorageSync('openid');
    this.login();
    //重定向
    if (app.openid === '') {
      wx.navigateTo({
        url: '/pages/more/login'
      });
    }
  },
  login: function () {
    var _this = this;
    //如果有缓存，则提前加载缓存
    // if (app.cache.version === app.version) {
    //   try {
    //     _this.response();
    //   } catch (e) {
    //     //报错则清除缓存
    //     app.cache = {};
    //     //wx.clearStorage();
    //   }
    // }
    //然后再尝试登录用户, 如果缓存更新将执行该回调函数

    app.getUser(function (status) {
      _this.response.call(_this, status);
    });
  },
  response: function (status) {
    console.log("执行了response")
    var _this = this;
    if (status) {
      if (status != '离线缓存模式') {
        //错误
        _this.setData({
          'remind': status
        });
        return;
      } else {
        //离线缓存模式
        _this.setData({
          offline: true
        });
      }
    }
    _this.setData({
      user: app._user
    });
    //判断绑定状态
    if (!app._user.is_bind) {
      _this.setData({
        'remind': '未绑定'
      });
    } else {
      _this.setData({
        'remind': '加载中'
      });
      //_this.getCardData();
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
  getCardData: function () {
    console.log("更新卡片内容");
    var _this = this;
    //判断并读取缓存
    if (app.cache.kb) { kbRender(app.cache.kb); }
    if (app.cache.ykt) { yktRender(app.cache.ykt); }
    if (app.cache.sdf) { sdfRender(app.cache.sdf); }
    if (app.cache.jy) { jyRender(app.cache.jy); }
    if (_this.data.offline) { return; }
    //wx.showNavigationBarLoading();

    //课表渲染
    function kbRender(info) {
      var today = parseInt(info.day),
        lessons = info.lessons[today === 0 ? 6 : today - 1], //day为0表示周日(6)，day为1表示周一(0)..
        list = [],
        time_list = _this.data.card.kb.time_list;
      for (var i = 0; i < 6; i++) {
        for (var j = 0; j < lessons[i].length; j++) {
          var lesson = lessons[i][j];
          if (lesson.weeks && lesson.weeks.indexOf(parseInt(info.week)) !== -1) {
            var begin_lesson = 2 * i + 1, end_lesson = 2 * i + lesson.number;
            list.push({
              when: begin_lesson + ' - ' + end_lesson + '节'
              + '（' + time_list[begin_lesson - 1].begin + '~' + time_list[end_lesson - 1].end + '）',
              what: lesson.name,
              where: lesson.place.trim()
            });
          }
        }
      }
      _this.setData({
        'card.kb.data': list,
        'card.kb.show': true,
        'card.kb.nothing': !list.length,
        'remind': ''
      });
      _this.on
    }
    //获取课表数据
    var kb_data = {
      id: app._user.we.info.id,
    };
    if (app._user.teacher) { kb_data.type = 'teacher'; }
    var loadsum = 0; //正在请求连接数
    loadsum++; //新增正在请求连接
    wx.request({
      url: app._server + '/api/get_kebiao.php',
      method: 'POST',
      data: app.key(kb_data),
      success: function (res) {
        if (res.data && res.data.status === 200) {
          var info = res.data.data;
          if (info) {
            //保存课表缓存
            app.saveCache('kb', info);
            kbRender(info);
          }
        } else { app.removeCache('kb'); }
      },
      complete: function () {
        loadsum--; //减少正在请求连接
        if (!loadsum) {
          if (_this.data.remind == '加载中') {
            _this.setData({
              remind: '首页暂无展示'
            });
          }
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
        }
      }
    });

    //借阅信息渲染
    function jyRender(info) {
      if (parseInt(info.books_num) && info.book_list && info.book_list.length) {
        var nowTime = new Date().getTime();
        info.book_list.map(function (e) {
          var oDate = e.yhrq.split('-'),
            oTime = new Date(oDate[0], oDate[1] - 1, oDate[2]).getTime();
          e.timing = parseInt((oTime - nowTime) / 1000 / 60 / 60 / 24);
          return e;
        });
        _this.setData({
          'card.jy.data': info,
          'card.jy.show': true,
          'remind': ''
        });
      }
    }
    //获取借阅信息
    loadsum++; //新增正在请求连接
    wx.request({
      url: app._server + "/api/get_books.php",
      method: 'POST',
      data: app.key({
        ykth: app._user.we.ykth
      }),
      success: function (res) {
        if (res.data && res.data.status === 200) {
          var info = res.data.data;
          if (info) {
            //保存借阅缓存
            app.saveCache('jy', info);
            jyRender(info);
          }
        } else { app.removeCache('jy'); }
      },
      complete: function () {
        loadsum--; //减少正在请求连接
        if (!loadsum) {
          if (_this.data.remind) {
            _this.setData({
              remind: '首页暂无展示'
            });
          }
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
        }
      }
    });
  }
});