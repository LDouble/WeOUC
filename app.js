//app.js
App({
  version: 'v9.0.0', //版本号
  today: '',
  logincode: '',
  openid: '',
  beginday: '2017/09/18',//开学那一天,注意格式要一致（不够要补上0）
  schoolweek: 1,//教学周
  onLaunch: function () {
    var _this = this;
    //读取缓存
    try {
      this.token = wx.getStorageSync("token");
      var info = wx.getStorageSync("userinfo")
      this.username = wx.getStorageSync("username")
      this.password = wx.getStorageSync("password")
      var cversion = wx.getStorageSync("version");
      if(cversion != _this.version){
        wx.clearStorageSync()
        //wx.removeStorageSync("stuclass")
        //wx.setStorageSync("version", _this.version);       
      }   
      if(!info)
        this.getUser()
      else
        this._user.wx = info.userInfo;
      var stu = wx.getStorageSync("stuinfo")
      if(stu && this.token)
        this._user.we = info.userInfo;
    }catch (e) { console.warn(e) } //加载时先尝试读token;
  },
  getlogincode: function () {
    wx.login({
      success: function (res) {
        if (res.code) {
          this.logincode = res.code;
        } else {
          this.showErrorModal("获取用户登录态失败！请重新打开We海大", res.errMsg);
        }
      }
    });
  },
  //保存缓存
  saveCache: function (key, value) {
    if (!key || !value) { return; }
    var _this = this;
    _this.cache[key] = value;
    wx.setStorage({
      key: key,
      data: value
    });
  },
  //清除缓存
  removeCache: function (key) {
    if (!key) { return; }
    var _this = this;
    _this.cache[key] = '';
    wx.removeStorage({
      key: key
    });
  },
  //后台切换至前台时
  onShow: function () {
    var _this = this;
    var _this = this;
    _this.schoolweek = parseInt(_this.calWeek());
  },
  //判断是否有登录信息，让分享时自动登录
  loginLoad: function (onLoad) {
    var _this = this;
    if (!_this._t) {  //无登录信息
      _this.getUser(function (e) {
        typeof onLoad == "function" && onLoad(e);
      });
    } else {  //有登录信息
      typeof onLoad == "function" && onLoad();
    }
  },
  //getUser函数，在index中调用
  getUser: function (response) {
    var _this = this;
    wx.showNavigationBarLoading();
    wx.login({
      success: function (res) {
        if (res.code) {
          //调用函数获取微信用户信息
            _this.getUserInfo(function (info) {
            _this.saveCache('userinfo', info); //保存微信信息
            _this._user.wx = info.userInfo;
            if (info == "未授权"){
              typeof response == "function" && response("未授权");
              return;
            }
            else if (!info.encryptedData || !info.iv) {
              _this.g_status = '无关联AppID';
              typeof response == "function" && response(_this.g_status);
              return;
            }else{
                typeof response == "function" && response("获取信息成功");
                return;
            }
          });
        }
      },
      fail:function(){
        typeof response == "function" && response("未授权");
      }

    });
  },
  processData: function (key) {
    var _this = this;
    var data = JSON.parse(_this.util.base64.decode(key));
    _this._user.is_bind = data.is_bind;
    _this._user.openid = data.user.openid;
    _this._user.teacher = (data.user.type == '教职工');
    _this._user.we = data.user;
    _this._time = data.time;
    _this._t = data['\x74\x6f\x6b\x65\x6e'];
    return data;
  },
  getUserInfo: function (cb) {
    var _this = this;
    //获取微信用户信息
    wx.getUserInfo({
      success: function (res) {
        typeof cb == "function" && cb(res);
      },
      fail: function (res) {
        _this.g_status = '未授权';
        typeof cb == "function" && cb("未授权");
      }
    });
  },
  //传入时间计算周数
  checkSettingStatu: function (cb) {
    var that = this;
    // 判断是否是第一次授权，非第一次授权且授权失败则进行提醒
    wx.getSetting({
      success: function success(res) {
        var authSetting = res.authSetting;
          if (authSetting['scope.userInfo'] === false) {
            wx.showModal({
              title: '用户未授权',
              content: '如需正常使用WeOUC，请按确定并在授权管理中选中“用户信息”，然后点按确定。最后关闭微信后台，重启微信后再进入小程序即可正常使用。',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.openSetting({
                    success: function success(res) {
                      that.getStuinfo()
                    }
                  });
                }
              }
            })
          }
      }
    });
  },
  getStuinfo: function (response) {
    var _this = this;
    wx.showNavigationBarLoading();
    wx.request({
      url: _this._server + '/oucjw/info',
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      data: {
        token: _this.token,
      },
      method: 'POST',
      success: function (res) {
        if (res && res.data.status == 200) {
          var stuinfo = res.data.info;
          _this._user.we = stuinfo;
          typeof response == "function" && response(stuinfo)
          wx.setStorageSync('stuinfo', stuinfo);
        }
        else {
          if (res && res.data.status >= 50000) {
            _this.showErrorModal("请稍后再打开此页面", res.data.data)
          }
          else {
            _this.showErrorModal("请稍后再打开此页面，或者联系客服", "客户端异常")
          }
        }
      },
      fail: function () {
        _this.showErrorModal("服务器连接失败", "请检查网络连接")
      },
      complete: function () {
        wx.hideNavigationBarLoading();
      }
    })
  },
  getISOYearWeek: function (date) {
    var _this = this;
    var commericalyear = _this.getCommerialYear(date);
    var date2 = _this.getYearFirstWeekDate(commericalyear);
    var day1 = date.getDay();
    if (day1 == 0) day1 = 7;
    var day2 = date2.getDay();
    if (day2 == 0) day2 = 7;
    var d = Math.round((date.getTime() - date2.getTime() + (day2 - day1) * (24 * 60 * 60 * 1000)) / 86400000);
    if ((Math.ceil(d / 7)) > 0){
      console.log(d);
      return d;
    }

    else
          return 1
  },
  getYearFirstWeekDate: function (commericalyear) {
    var _this = this;
    var yearfirstdaydate = new Date(commericalyear, 0, 1);
    var daynum = yearfirstdaydate.getDay();
    var monthday = yearfirstdaydate.getDate();
    if (daynum == 0) daynum = 7;
    if (daynum <= 4) {
      return new Date(yearfirstdaydate.getFullYear(), yearfirstdaydate.getMonth(), monthday + 1 - daynum);
    } else {
      return new Date(yearfirstdaydate.getFullYear(), yearfirstdaydate.getMonth(), monthday + 8 - daynum)
    }
  },
  getCommerialYear: function (date) {
    var _this = this;
    var daynum = date.getDay();
    var monthday = date.getDate();
    if (daynum == 0) daynum = 7;
    var thisthurdaydate = new Date(date.getFullYear(), date.getMonth(), monthday + 4 - daynum);
    return thisthurdaydate.getFullYear();
  },
  //检验当天课程
  in_array: function (arr) {
    var _this = this;

    // 不是数组返回错误
    if (arr == null || arr == '' || arr === []) {
      //console.log('不是数组返回错误');
      return false;
    }

    //console.log("app的当前校历周数是："+ _this.schoolweek);

    var classweek = parseInt(_this.calWeek());
    for (var i = 0, k = arr.length; i < k; i++) {
      if (classweek == arr[i]) {
        //console.log("存在")
        return true;
      }
    }
  
  },
  showErrorModal: function (content, title) {
    wx.showModal({
      title: title || '加载失败',
      content: content || '未知错误',
      showCancel: false
    });
  },
  showLoadToast: function (title, duration) {
    wx.showToast({
      title: title || '加载中',
      icon: 'loading',
      mask: true,
      duration: duration || 10000
    });
  },
  util: require('./utils/util'),
  key: function (data) { return this.util.key(data) },
  //控制周数，返回当前教学周数
  calWeek: function () {
    var _this = this;
    var begindate = new Date(_this.beginday);
    var beginweek = parseInt(_this.getISOYearWeek(begindate));

    var nowdate = new Date();
    var intYear = parseInt(nowdate.getFullYear());
    var intMon = parseInt(nowdate.getMonth()) + 1;
    var intDate = parseInt(nowdate.getDate());
    nowdate = new Date(intYear + '/' + intMon + '/' + intDate);
    // if (intMon < 10) { intMon = '0' + intMon }
    // if (intDate < 10) { intDate = '0' + intMon }
    // var tempstr = intYear + '/' + intMon + '/' + intDate;
    // var tempdate1 = new Date(tempstr);
    // var thisweek = _this.getISOYearWeek(tempdate1);
    // var week = parseInt(thisweek - beginweek);
    var days = nowdate.getTime() - begindate.getTime();
    var time = Math.ceil(days / (1000 * 60 * 60 * 24)) + 1;
    console.log((days / (1000 * 60 * 60 * 24)))
    return Math.ceil(time/7);
  },
  cache: {},
  //_server: 'http://api.it592.com',
  //_server: 'http://192.168.218.1:5000',
  _server: 'https://oucjw.it592.com',
//  _server: 'http://114.115.200.3:5000',  
  _user: {
    //微信数据
    wx: {},
    //学生\老师数据
    we: {}
  },
  _time: {}, //当前学期周数
  _xq: '0',
  _xn: '2017',
  _type: 3
});
