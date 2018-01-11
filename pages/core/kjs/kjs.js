//kjs.js
//获取应用实例
var app = getApp();

// 定义常量数据
var WEEK_DATA = ['', '第一周', '第二周', '第三周', '第四周', '第五周', '第六周', '第七周', '第八周', '第九周', '第十周',
                    '十一周', '十二周', '十三周', '十四周', '十五周', '十六周', '十七周'],
    DAY_DATA = ['', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    CLASSTIME_DATA = ['', {time: '1-2节', index: '1'}, {time: '3-4节', index: '3'}, {time: '5-6节', index: '5'},
                      {time: '7-8节', index: '7'}, {time: '9-10节', index: '9'}, {time: '11-12节', index: '11'}],
    BUILDING_DATA = ['', '新教', '一区', '二区', '三区', '四区', '五区', '六区', '七区', '八区'];

Page({
  data: {
    DATA: {
      WEEK_DATA: WEEK_DATA,
      DAY_DATA: DAY_DATA,
      CLASSTIME_DATA: CLASSTIME_DATA,
      BUILDING_DATA: BUILDING_DATA,
    },
    active: { // 发送请求的数据对象 初始为默认值
      weekNo: 1,
      weekDay: 1,
      buildingNo: 5,
      classNo: 1,
    },
    nowWeekNo: 1,
    testData: null
  },

  onLoad: function(){
    var classweek = parseInt(app.calWeek())
    var  week = new Date().getDay();
    var t =  new Date().getHours()
    var begin = 1;
    if(t < 10)
            begin = 1;
    else if( 10 < t < 12)
            begin = 3;
    else if (12 <= t < 15)
           begin = 5;
    else if (15 <= t )
          begin = 7;
    this.setData({
      'nowWeekNo': classweek,
      'active.weekNo': classweek,
      'active.weekDay':week,
      'active.classNo': begin,
      
    });
    // 初始默认显示
    this.sendRequest();
  },

  //下拉更新
  onPullDownRefresh: function(){

    this.sendRequest();
  },

  // 发送请求的函数
  sendRequest: function(query, bd){
    app.showErrorModal("考试周期间暂停服务");
    _this.setData({
      remind: '暂停服务'
    });
    return;
    app.showLoadToast();

    var that = this;
    var query = query || {}, activeData = that.data.active;
    var requestData = {
      week: query.weekNo || activeData.weekNo,
      day: query.weekDay || activeData.weekDay,
      begin: that.data.DATA.CLASSTIME_DATA[query.classNo || activeData.classNo].index,
      build: query.buildingNo || activeData.buildingNo,
    };
    requestData.day -= 1
    requestData.build -= 1
    // 对成功进行处理
    function doSuccess(data) {

      that.setData({
        'testData': data,
        'errObj.errorDisplay': true
      });
    }

    // 对失败进行处理
    function doFail(message) {

      app.showErrorModal(message);
    }

    // 发送请求
    wx.request({
      url: app._server + '/oucjw/emptyRoom', 
      method: 'POST',
      data: requestData,
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      success: function(res) {
        if(res.data && res.data.status === "200"){
          doSuccess(res.data.data);
          //执行回调函数
          if(bd){ bd(that); }
        }else{
          doFail(res.data.message);
        }
      },
      fail: function(res) {
        doFail(res.errMsg);
      },
      complete: function() {
        wx.hideToast();
        wx.stopPullDownRefresh();
      }
    });
  },

  // week
  chooseWeek: function (e) {
    
    var index = parseInt(e.target.dataset.weekno, 10);
    
    if(isNaN(index)){ return false; }

    this.sendRequest({
      weekNo: index
    }, function(that){
      that.setData({
        'active.weekNo': index
      });
    });
  },

  // day
  chooseDay: function (e) {

    var index = parseInt(e.target.dataset.dayno, 10);
    
    if(isNaN(index)){ return false; }

    this.sendRequest({
      weekDay: index
    }, function(that){
      that.setData({
        'active.weekDay': index
      });
    });
  },

  // classTime
  chooseClaasTime: function (e) {
    
    var index = e.target.dataset.classno;
    
    if(isNaN(index)){ return false; }

    this.sendRequest({
      classNo: index
    }, function(that){
      that.setData({
        'active.classNo': index
      });
    });
  },

  // building
  chooseBuilding: function (e) {
    var index = e.target.dataset.buildingno
    
    if(isNaN(index)){ return false; }

    this.sendRequest({
      buildingNo: index
    }, function(that){
      that.setData({
        'active.buildingNo': index
      });
    });
  }
});