//app.js
App({
  version: 'v0.1.2', //版本号
  today: '',
  logincode: '',
  openid: '',
  beginweek: '9',
  thisweek: '',
  onLaunch: function () {
    var _this = this;
    //读取缓存
    try {
      var data = wx.getStorageInfoSync();
      if (data && data.keys.length) {
        data.keys.forEach(function (key) {
          var value = wx.getStorageSync(key);
          if (value) {
            _this.cache[key] = value;
          }
        });
        if (_this.cache.version !== _this.version) {
          _this.cache = {};
          //wx.clearStorage();
        } else {
          _this._user.wx = _this.cache.userinfo.userInfo || {};
          _this.processData(_this.cache.userdata);
        }
      }
    } catch (e) { console.warn('获取缓存失败'); }
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
    var date = new Date();
    var thisweek = _this.getISOYearWeek(date);
    _this.thisweek = thisweek;
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
    //wx.showNavigationBarLoading();
    wx.login({
      success: function (res) {
        if (res.code) {
          //调用函数获取微信用户信息
          _this.getUserInfo(function (info) {
            _this.saveCache('userinfo', info);
            _this._user.wx = info.userInfo;
            if (!info.encryptedData || !info.iv) {
              _this.g_status = '无关联AppID';
              typeof response == "function" && response(_this.g_status);
              console.log('执行了info.encryptedData');
              return;
            }
          });
        }
      }
    });
    console.log("appjsgetUser函数调用");
    if (!wx.getStorageSync("openid")) {
      wx.showToast({
        title: 'appjs未绑定',
        icon: 'success',
        duration: 1000
      });
      wx.navigateTo({
        url: '/pages/more/login'
      });
    }
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
        _this.showErrorModal('拒绝授权将导致无法关联学校帐号并影响使用，请关闭We华软后台，再打开We华软再点击允许授权！', '授权失败');
        _this.g_status = '未授权';
      }
    });
  },
  //计算当前周数
  getISOYearWeek: function (date) {
    var _this = this;
    var commericalyear = _this.getCommerialYear(date);
    var date2 = _this.getYearFirstWeekDate(commericalyear);
    var day1 = date.getDay();
    if (day1 == 0) day1 = 7;
    var day2 = date2.getDay();
    if (day2 == 0) day2 = 7;
    var d = Math.round((date.getTime() - date2.getTime() + (day2 - day1) * (24 * 60 * 60 * 1000)) / 86400000);
    return Math.ceil(d / 7) + 1;
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
  in_array: function (arr) {
    var _this = this;

    // 不是数组返回错误
    if (arr == null || arr == '' || arr === []) {
      console.log('不是数组返回错误');
      return false;
    }
    if (_this.thisweek == '' || null) {
      var date = new Date();
      var thisweek = _this.getISOYearWeek(date);
      _this.thisweek = thisweek;
    }
    var thisweek = _this.thisweek-_this.beginweek+1;
    if(thisweek<=1){
      thisweek=1;
    }
    console.log(thisweek);
    for (var i = 0, k = arr.length; i < k; i++) {
      if (thisweek == arr[i]) {
        console.log("存在")
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
  cache: {},
  _server: 'https://wxapp.yicodes.com',
  _user: {
    //微信数据
    wx: {},
    //学生\老师数据
    we: {}
  },
  _time: {} //当前学期周数
});