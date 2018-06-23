//ks.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    list: [],
    first: 1
  },
  togglePage: function(e) {
    var id = e.currentTarget.id,
      data = {};
    data.show = [];
    for (var i = 0, len = this.data.class.length; i < len; i++) {
      data.show[i] = false;
    }
    if (this.data.first) {
      this.setData(data);
      this.data.first = 0;
    }
    data.show[id] = !this.data.show[id];
    this.setData(data);
  },
  onPullDownRefresh: function() {
    var _this = this;
    _this.loginHandler({
      id: _this.data.id || app._user.we.info.id,
      name: _this.data.name || app._user.we.info.name
    });
  },
  onLoad: function(options) {
    var _this = this;
    if (app.user_token === '' || app.user_token === null) {
      app.remind = "未绑定"
      wx.navigateTo({
        url: '/pages/index/index'
      });
    }
    app.name = app.name || wx.getStorageSync("name")
    app.xh = app.xh || wx.getStorageSync("xh")
    this.setData({
      xh: app.xh,
      name: app.name,
      offline: app.offline
    })
  },
  onShow: function() {
    this.setData({
      offline: app.offline
    })
    if (!app.offline)
      this.get_ks()
    else {
      var ks = wx.getStorageSync("ks")
      _this.ksRender(ks)
    }
  },
  //让分享时自动登录
  get_ks: function() {
    var _this = this;
    app.http.post({
      url: app._server + "/test",
      params: app.jwc
    }).then((res) => {
      var ks = res.data.sort(function(a, b) {
        var y = a['time'];
        var x = b['time'];
        console.log(x)
        if (x == ".")
          return -5
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
      wx.setStorageSync('ks', ks);
      _this.ksRender(ks)
    }).catch((error) => {
      var ks = wx.getStorageSync("ks")
      _this.ksRender(ks)
      _this.setData({
        offline: true
      })
      console.log(error)
    })
  },
  ksRender: function(list) {
    if (!list || !list.length) {
      _this.setData({
        remind: '无考试安排'
      });
      return false;
    }
    var days = ['一', '二', '三', '四', '五', '六', '日'];
    var types = ["补考/缓考", "期中考试", "期末考试"]
    for (var i = 0, len = list.length; i < len; ++i) {
      //list[i].type = types[list[i].type - 1];
      list[i].open = false;
      list[i].index = i;
      list[i].name = list[i].name.replace(/\[[0-9]*\]/ig, "");
      if (list[i].time == '.') {
        list[i].date = "非统一考试";
        list[i].time = "非统一考试";
        list[i].num = "非统一考试";
        list[i].address = "";
      } else {
        var pattern = /(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})-(\d{2}:\d{2})/;
        console.log(list[i].time)
        var arr = pattern.exec(list[i].time);
        list[i].date = list[i].time
        var date = arr[1]; //获取时间进行判断
        var ss = date + " " + arr[2];
        var to = new Date(ss).getTime() - new Date().getTime();
        if (to / 1000 / 60 >= 20) {
          list[i].num = "请先通过选课系统查询。备用查询考试前20分钟公布";
          list[i].address = "请先通过选课系统查询。备用查询考试前20分钟公布";
        }
        list[i].time = arr[2] + "-" + arr[3];
      }
      //list[i].day = days[list[i].day - 1];
      //  list[i].time = list[i].time.trim().replace('—','~');
      //list[i].lesson = list[i].lesson.replace(',','-');
      //倒计时提醒
      // if(list[i].days > 0){
      //   list[i].countdown = '还有' + list[i].days + '天考试';
      //   list[i].place = '（'+list[i].time+'）'+list[i].room;
      //   if(!app._user.teacher){
      //     list[i].place += '#'+list[i].number;
      //   }
      // }else if(list[i].days < 0){
      //   list[i].countdown = '考试已过了' + (-list[i].days) + '天';
      //   list[i].place = '';
      // }else{
      //   list[i].countdown = '今天考试';
      //   list[i].place = '（'+list[i].time+'）'+list[i].room;
      //   if(!app._user.teacher){
      //     list[i].place += '#'+list[i].number;
      //   }
      // }
    }
    list[0].open = true;
    this.setData({
      list: list,
      remind: ''
    });
  },
  // 展示考试详情
  slideDetail: function(e) {
    var id = e.currentTarget.dataset.id,
      list = this.data.list;
    // 每次点击都将当前open换为相反的状态并更新到视图，视图根据open的值来切换css
    for (var i = 0, len = list.length; i < len; ++i) {
      if (i == id) {
        list[i].open = !list[i].open;
      } else {
        list[i].open = false;
      }
    }
    this.setData({
      list: list
    });
  },
  dealtest: function(e) {
    var pattern = /(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})-(\d{2}:\d{2})/
    var arr = pattern.exec(e.date)
    var result = new Object()
    if (arr && arr.length == 4) {
      result = {
        time: arr[2] + "-" + arr[3],
        day: this.getDay(arr[1]),
        days: this.GetDateDiff(arr[1]),
        begin: arr[2],
        end: arr[3],
        date: arr[1]
      }
    }
    result.origin = e.date
    result.number = e.num
    result.room = e.address
    console.log(result)
    return result
  },
  getDay: function(sDate) {
    var dt = new Date(sDate.replace(/-/g, '/'));
    return dt.getDay()
  },

  GetDateDiff: function(endDate) {
    var startTime = new Date().getTime()
    var endTime = new Date(Date.parse(endDate.replace(/-/g, "/"))).getTime();
    var dates = (endTime - startTime) / (1000 * 60 * 60 * 24);
    return parseInt(dates);
  },
});