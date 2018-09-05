App({
  version: 'v2016.6.28', //版本号
  today: '',
  logincode: '',
  openid: '',
  beginday: '2018/08/20', //开学那一天,注意格式要一致（不够要补上0）
  schoolweek: 1, //教学周
  _time: {}, //当前学期周数
  remind: "",
  offline: false,
  xn: 2018,
  xq: 0,
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function() {
    if (wx.getUpdateManager) {
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
    }
    this.week = this.calWeek()
    if (new Date() >= new Date("2018-09-14"))
      this.beginday = '2018/09/17'
  },
  /**
   * 初始化，包括计算当前周次，加载相关
   */

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
    if (this.version != wx.getStorageSync("version")) { // 判断app版本是否为最新的，
      wx.clearStorageSync();
      wx.setStorageSync("version", this.version)
    } else {
      this.user_token = wx.getStorageSync("user_token"); // 获取user_token
      if (!this.user_token)
        this.remind = "未绑定"
      else
        this.remind = "加载中"
    }
    var that = this;
    wx.getNetworkType({
      success: function(res) {
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        if (res.networkType == "none") { //无网络
          that.offline = true;
          that.remind = "无网络"

        } else { // 有网络则请求服务器
          that.offline = false;
        }
      },
    });
    this.schoolweek = parseInt(this.calWeek());
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
  // http: require('/wepy-utils/lib/http'),
  // tips: require('/wepy-utils/lib/tips'),
  _server: "https://weouc.it592.com/api",
  //_server: "http://127.0.0.1:5000/api",
  util: require('./utils/util'),
})