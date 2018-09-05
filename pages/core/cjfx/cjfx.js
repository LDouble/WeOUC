// pages/core/cjfx/cjfx.js
var wxCharts = require('./wxchart.js');
var lineChart = null;
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    remind: "加载中",
    name:app.name
  },

  /**
   * 生命周期函数--监听页面加载
   */
  touchHandler: function(e) {
    console.log(lineChart.getCurrentDataIndex(e));
    lineChart.showToolTip(e, {
      // background: '#7cb5ec',
      format: function(item, category) {
        return category + '' + item.name + ':' + item.data
      }
    });
  },
  updateData: function() {
    var _this = this;
    wx.request({
      url: app._server + "/cj",
      data: app.jwc,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function(res) {
        console.log(res)
        res = res.data
        if (res && res.data) {
          var cj = res.data
          var last = ""
          var xn, xq, xf = 0,
            score
          var temp_xf = {}
          var temp_score = {}
          var categories = [];
          var data = [];
          var xnxq = ""
          var temp = [] // 储存已经学过的课程。
          var gk = 0;
          var gkxf = 0;
          for (var i = 0; i < cj.length; i++) {
            if (cj[i].more == "缓考" || temp.indexOf(cj[i].name) != -1) {
              continue
            } else {
              temp.push(cj[i].name)
              var score = _this.cjhs(cj[i].score);
              if (last != cj[i].xq) {
                console.log(456)
                if (last != "" && temp_xf[xn + xq]) {
                  console.log(temp_score[xn + xq])
                  console.log(temp_xf[xn + xq])
                  var aver = temp_score[xn + xq] / temp_xf[xn + xq] + (0.2 * temp_xf[xn + xq]-gkxf)
                  console.log(aver)
                  categories.push(xnxq)
                  data.push(aver)
                }
                xn = cj[i].xq.replace(/[^0-9]/ig, "");
                if (cj[i].xq.indexOf("春") != -1) {
                  xq = "2";
                  xnxq = xn + "春"
                  xn -= 1
                } else if (cj[i].xq.indexOf("夏") != -1) {
                  xnxq = xn + "夏"
                  xq = "0";
                } else if (cj[i].xq.indexOf("秋") != -1) {
                  xnxq = xn + "秋"
                  xq = "1"
                }
                temp_score[xn + xq] = 0
                temp_xf[xn + xq] = 0
                last = cj[i].xq
                gkxf = 0
              }
              if (score != undefined) {
                temp_score[xn + xq] += score * parseFloat(cj[i].xf)
                temp_xf[xn + xq] += parseFloat(cj[i].xf)
                if (score < 60){
                  gk += 1;
                  gkxf += parseFloat(cj[i].xf)
                }
              }
              xf += parseFloat(cj[i].xf)
            }
          }
          if (temp_xf[xn + xq]) {
            var aver = (temp_score[xn + xq] / temp_xf[xn + xq] + 0.2 * temp_xf[xn + xq])
            categories.push(xnxq)
            data.push(aver)
          }
          var series = [{
            name: '学年',
            data: data,
            format: function(val, name) {
              return val.toFixed(2) + '分';
            }
          }];
          //var time = categories.length
          lineChart.updateData({
            categories: categories,
            series: series
          });
          app.name = app.name || wx.getStorageSync("name")
          _this.setData({
            remind: "",
            xf: xf,
            time: Math.round(categories.length / 3),
            times:categories.length,
            gk: gk,
            name:app.name
          })
        } else {
          _this.setData({
            remind: "加载失败，请稍后再试"
          })
          return undefined
        }
      },
      fail: function(error) {
        _this.setData({
          remind: "加载失败，请稍后再试"
        })
        return undefined
      },
      complete: function(res) {

      }
    });
  },
  onLoad: function(e) {
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    lineChart = new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      categories: [{}],
      animation: true,
      // background: '#f5f5f5',
      series: [{
        name: '成交量2',
        data: [2, 0, 0, 3, null, 4, 0, 0, 2, 0],
        format: function (val, name) {
          return val.toFixed(2) + '万';
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: '加权',
        format: function (val) {
          return val.toFixed(2);
        },
        min: 0
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
    console.log(123)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.updateData()
  },
  cjhs: function(cj) {
    if (parseFloat(cj)) {
      return cj;
    } else {
      switch (cj) {
        case "优秀":
        case "优":
          return 90;
        case "良":
        case "良好":
          return 80;
        case "中":
        case "中等":
          return 70;
        case "合格":
        case "及格":
          return 60
        case "不合格":
        case "不及格":
          return 0
        default:
          return undefined
      }
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})