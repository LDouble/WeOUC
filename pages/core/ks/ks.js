//ks.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    list: [],
    first: 1
  },
  togglePage: function (e) {
    var id = e.currentTarget.id, data = {};
    data.show = [];
    for (var i = 0, len = this.data.class.length; i < len; i++) {
        data.show[i] = false;
    }
    if(this.data.first){
      this.setData(data);
      this.data.first = 0;
    }
    data.show[id] = !this.data.show[id];
    this.setData(data);
  },
  //分享
  // onShareAppMessage: function(){
  //   var name = this.data.name || app._user.we.info.name,
  //       id = this.data.id || app._user.we.info.id;
  //   return {
  //     title: name + '的考试安排',
  //     desc: 'We海大 - 考试安排',
  //     path: '/pages/core/ks/ks?id='+id+'&name='+name
  //   };
  // },
  //下拉更新
  onPullDownRefresh: function(){
    var _this = this;
    _this.loginHandler({
      id: _this.data.id || app._user.we.info.id,
      name: _this.data.name || app._user.we.info.name
    });
  },
  onLoad: function(options){
    var _this = this;
    if (app.token === ''||app.token ===null) {
     //console.log("onshow token获取的缓存为空");
     wx.navigateTo({
       url: '/pages/more/login'
     });
   }
   if (wx.getStorageSync('stuinfo')) {
     var stuinfo = wx.getStorageSync('stuinfo')
     app._user.we=stuinfo;
   }else{
     app.getStuinfo()
   }
   _this.loginHandler()
  },
  //让分享时自动登录
  loginHandler: function(){
    var _this = this;
    var id, name;
    id = app._user.we.xh,
    name = app._user.we.username;
    if(!id || !name){
      _this.setData({
        remind: '未绑定'
      });
      return false;
    }
    _this.setData({
      id: id,
      name: name
    });
    var data = {
      token: app._user.token,
      id: id
    };

    function ksRender(list){
      if(!list || !list.length){
        _this.setData({
          remind: '无考试安排'
        });
        return false;
      }
      var days = ['一','二','三','四','五','六','日'];
      var types = ["补考/缓考","期中考试","期末考试"]
      for (var i = 0, len = list.length; i < len; ++i) {
        list[i].type = types[list[i].type - 1];
        list[i].open = false;
        list[i].index = i;
        if(list[i].date == ''){
          list[i].date = "非统一考试";
          list[i].time = "非统一考试";
          list[i].num = "非统一考试";
          list[i].address = "";
        }else{
          var pattern = /(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})-(\d{2}:\d{2})/;
          var arr = pattern.exec(list[i].date);
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
      _this.setData({
        list: list,
        remind: ''
      });
    }
    wx.showNavigationBarLoading();
    wx.request({
      url: app._server + "/oucjw/test",
      method: 'POST',
      header:{"Content-Type": "application/x-www-form-urlencoded" },
      data: {
        token:app.token,
        username: app.username,
        password: app.password,
        xn:app._xn,
        xq:app._xq,
        type:app._type
      },
      success: function(res) {
        if (res.data && res.data.status == "200"){
          var list = res.data.data;
          console.log(list)
          if(list) {
            // for(var i = 0; i < list.length; i++)
            //   list[i] = _this.dealtest(list[i])
            //   app.saveCache('ks', list);
          ksRender(list);
          }
          else
           {
             _this.setData({ remind: '暂无数据' });
           }

        } else {
          app.removeCache('ks');
          _this.setData({
            remind: res.data.message || '未知错误'
          });
        }
      },
      fail: function(res) {
        if(_this.data.remind == '加载中'){
          _this.setData({
            remind: '网络错误'
          });
        }
        console.warn('网络错误');
      },
      complete: function() {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        app.showErrorModal('该数据仅供参考，请以选课系统为准！考试前请前往选课系统核对信息', '虾米提醒');
      }
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
    if(arr && arr.length == 4){
      result  = {
        time:arr[2] + "-" + arr[3],
        day:this.getDay(arr[1]),
        days:this.GetDateDiff(arr[1]),
        begin:arr[2],
        end:arr[3],
        date:arr[1]
      }
    }
    result.origin = e.date
    result.number = e.num
    result.room = e.address
    console.log(result)
    return result
  },
  getDay: function(sDate){
    var dt = new Date(sDate.replace(/-/g, '/'));
    return dt.getDay()
},

GetDateDiff: function(endDate){
  var startTime = new Date().getTime()
  var endTime = new Date(Date.parse(endDate.replace(/-/g,   "/"))).getTime();
  var dates = (endTime - startTime)/(1000*60*60*24);
  return  parseInt(dates);
},
});
