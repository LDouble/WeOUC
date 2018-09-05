//kjs.js
//获取应用实例
var app = getApp();
// 处理数组classNo
function getHandledClassNo(classNo) {
  var result = '';
  classNo.forEach(function(value, index) {
    if (value) {
      if (index === 1) {
        result = CLASSTIME_DATA[index].index;
      } else if (index > 1) {
        result = result + '@' + CLASSTIME_DATA[index].index;
      }
    }
  });
  return result;
}
Page({
  data: {
    "type": ["公共课", "通识课", "专业课", "研究生"],
    active: { // 发送请求的数据对象 初始为默认值
      weekNo: 1,
      weekDay: 1,
      buildingNo: 2,
      classNo: ['', true, false, false, false, false, false],
    },
    nowWeekNo: 1,
    testData: null
  },

  onLoad: function() {
    var date = new Date;
    var year = date.getFullYear();
    var itemlist = ["本学期", year - 1 + "夏", year - 1 + "秋", year + "春", year + "夏", year + "秋"]
    this.setData({
      'xq': itemlist,
      'active.weekNo': app._time.week
    });
    // 初始默认显示
    this.sendRequest();
  },

  //下拉更新
  onPullDownRefresh: function() {

    this.sendRequest();
  },

  // 发送请求的函数
  sendRequest: function(query, bd) {

    app.showLoadToast();

    var that = this;
    var query = query || {},
      activeData = that.data.active;
    var requestData = {
      weekNo: query.weekNo || activeData.weekNo,
      weekDay: query.weekDay || activeData.weekDay,
      classNo: getHandledClassNo(query.classNo || activeData.classNo),
      buildingNo: query.buildingNo || activeData.buildingNo,
      openid: app._user.openid,
    };

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
      url: app._server + '/api/get_empty_room.php',
      method: 'POST',
      data: app.key(requestData),
      success: function(res) {
        if (res.data && res.data.status === 200) {
          doSuccess(res.data.data);
          //执行回调函数
          if (bd) {
            bd(that);
          }
        } else {
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
  chooseWeek: function(e) {

    var index = parseInt(e.target.dataset.weekno, 10);

    if (isNaN(index)) {
      return false;
    }

    this.sendRequest({
      weekNo: index
    }, function(that) {
      that.setData({
        'active.weekNo': index
      });
    });
  },

  // day
  chooseDay: function(e) {

    var index = parseInt(e.target.dataset.dayno, 10);

    if (isNaN(index)) {
      return false;
    }

    this.sendRequest({
      weekDay: index
    }, function(that) {
      that.setData({
        'active.weekDay': index
      });
    });
  },

  // classTime
  chooseClaasTime: function(e) {

    var index = e.target.dataset.classno,
      classNo = this.data.active.classNo,
      selectNum = 0;
    console.log(classNo);
    classNo.forEach(function(value) {
      if (value)
        ++selectNum;
    });
    if (classNo[index] && selectNum > 1) {
      classNo[index] = !classNo[index];
    } else {
      classNo[index] = true;
    }
    if (isNaN(index)) {
      return false;
    }

    this.sendRequest({
      classNo: classNo
    }, function(that) {
      that.setData({
        'active.classNo': classNo
      });
    });
  },

  // building
  chooseBuilding: function(e) {

    var index = parseInt(e.target.dataset.buildingno, 10);

    if (isNaN(index)) {
      return false;
    }

    this.sendRequest({
      buildingNo: index
    }, function(that) {
      that.setData({
        'active.buildingNo': index
      });
    });
  }
});