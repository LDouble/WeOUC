App({
  version: '', //版本号
  today: '',
  logincode: '',
  openid: '',
  beginday: '2018/03/05', //开学那一天,注意格式要一致（不够要补上0）
  schoolweek: 1, //教学周
  _time: {}, //当前学期周数
  remind: "",
  offline: false,
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function() {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function(res) {
      console.log(res.hasUpdate)
    })
    updateManager.onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    updateManager.onUpdateFailed(function() {
      // 新的版本下载失败

    })
    var that = this;
    wx.getNetworkType({
      success: function(res) {
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        if (res.networkType == "none") { //无网络
          that.offline = true;
          that.init();
        } else { // 有网络则请求服务器
          that.offline = false;
          that.http.get({
            url: that._server + "/config"
          }).then(data => {
            that.init(data);
          }).catch(error => {
            that.init();
          })
        }
      },
    });
  },
  /**
   * 初始化，包括计算当前周次，加载相关
   */
  init: function(data = undefined) {
    var that = this;
    if (data != undefined) {
      /*
      获取到服务器的版本后，初始化完毕
      然后到index进行判断是否为新版本，如果是新版本，则清空缓存重新获取信息。
     */
      that.version = data.version;
      that.slides = data.slides;
      if (that.version != wx.getStorageSync("version")) {
        wx.removeStorageSync("stuclass"); //清空stuclass，重新进行绑定。
        wx.setStorageSync("version", that.version);
      }
      wx.setStorageSync("slides", that.slides);
    } else {
      that.version = wx.getStorageSync("version")
      that.slides = wx.getStorageSync("slides")
    }
  },
  calWeek: function() {
    var _this = this;
    var begindate = new Date(_this.beginday);
    var beginweek = parseInt(_this.getISOYearWeek(begindate));

    var nowdate = new Date();
    var intYear = parseInt(nowdate.getFullYear());
    var intMon = parseInt(nowdate.getMonth()) + 1;
    var intDate = parseInt(nowdate.getDate());
    nowdate = new Date(intYear + '/' + intMon + '/' + intDate);
    var days = nowdate.getTime() - begindate.getTime();
    var time = Math.ceil(days / (1000 * 60 * 60 * 24)) + 1;
    return Math.ceil(time / 7);
  },
  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function(options) {
    this.schoolweek = parseInt(this.calWeek());
    this.user_token = wx.getStorageSync("user_token"); // 获取user_token
    if (!this.user_token)
      this.remind = "未绑定"
    else
      this.remind = "加载中"
  },
  getISOYearWeek: function(date) {
    var _this = this;
    var commericalyear = _this.getCommerialYear(date);
    var date2 = _this.getYearFirstWeekDate(commericalyear);
    var day1 = date.getDay();
    if (day1 == 0) day1 = 7;
    var day2 = date2.getDay();
    if (day2 == 0) day2 = 7;
    var d = Math.round((date.getTime() - date2.getTime() + (day2 - day1) * (24 * 60 * 60 * 1000)) / 86400000);
    if ((Math.ceil(d / 7)) > 0) {
      return d;
    } else
      return 1
  },
  getYearFirstWeekDate: function(commericalyear) {
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
  getCommerialYear: function(date) {
    var _this = this;
    var daynum = date.getDay();
    var monthday = date.getDate();
    if (daynum == 0) daynum = 7;
    var thisthurdaydate = new Date(date.getFullYear(), date.getMonth(), monthday + 4 - daynum);
    return thisthurdaydate.getFullYear();
  },
  in_array: function(arr) {
    var _this = this;
    if (arr == null || arr == '' || arr === []) {
      return false;
    }
    var classweek = parseInt(_this.calWeek());
    for (var i = 0, k = arr.length; i < k; i++) {
      if (classweek == arr[i]) {
        return true;
      }
    }
  },
  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function() {

  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function(msg) {

  },
  http: require('/wepy-utils/lib/http'),
  tips: require('/wepy-utils/lib/tips'),
  _server: "http://127.0.0.1:5000/api",
  util: require('./utils/util'),
})