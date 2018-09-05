//kb.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '',
    thisweek: '',
    nothingclass: false,
    stuclass: null,
    _days: ['一', '二', '三', '四', '五', '六', '日'],
    _weeks: ['第一周', '第二周', '第三周', '第四周', '第五周', '第六周', '第七周', '第八周', '第九周', '第十周', '十一周', '十二周', '十三周', '十四周', '十五周', '十六周', '十七周', '十八周', '十九周', '二十周'],
    scroll: {
      left: 0
    },
    targetLessons: [],
    blur: false,
    today: '', //当前星期数
    toweek: 1, //当前周数
    week: 1, //视图周数（'*'表示学期视图）
    lessons: [], //课程data
    dates: [], //本周日期
    teacher: false //是否为教师课表
  },
  //分享
  // onShareAppMessage: function(){
  //   var name = this.data.name || app._user.we.info.name,
  //       id = this.data.id || app._user.we.info.id;
  //   return {
  //     title: name + '的课表',
  //     desc: 'We华软 - 课表查询',
  //     path: '/pages/core/kb/kb?id='+id+'&name='+name
  //   };
  // },
  onLoad: function (options) {
    var _this = this;

    var classweek = parseInt(app.calWeek());
    _this.classweek = classweek;
    var today = app.today - 1;
    if (today < 0) {
      today = 6;
    }
    //console.log("当前校历是："+classweek);
    _this.setData({
      today: today,
      toweek: classweek,
      week: classweek
    });
    // onLoad时获取一次课表
    var id = app.token;
    if (id == '') {
      _this.setData({
        remind: '未绑定'
      });
      return false;
    }
    _this.get_kb(id);
  },
  //让分享时自动登录
  loginHandler: function (options) {
    //console.log('让分享时自动登录');
    var _this = this;
    _this.setData({
      'term': app._time.term,
      'teacher': app._user.teacher
    });
  },
  onShow: function () {
    var _this = this;
    //设置滚动至当前时间附近，如果周末为设置left为其最大值102
    var nowWeek = new Date().getDay();
    console.log(_this.classweek)
    _this.setData({
      'scroll.left': (nowWeek === 6 || nowWeek === 0) ? 102 : 0
    });
    if (_this.classweek <= 0) {
      //切换视图(周/学期) *表示学期视图
      this.setData({
        week: "*"
      });
    }
  },
  onReady: function () {
    var _this = this;
    //查询其他人课表时显示
    if (_this.data.name) {
      wx.setNavigationBarTitle({
        title: _this.data.name + '的课表'
      });
    }
  },
  scrollXHandle: function (e) {
    this.setData({
      'scroll.left': e.detail.scrollLeft
    });
  },
  showDetail: function (e) {
    var _this = this;
    var week = _this.data.week;
    var dataset = e.currentTarget.dataset;
    var lessons = _this.data.lessons[dataset.day][dataset.wid];
    var targetI = 0;
    lessons[dataset.cid].target = true;
    lessons.map(function (e, i) {
      if (lessons.length === 1) {
        e.left = 0;
      } else {
        var left0 = -60 * (lessons.length - 1);
        if (dataset.day <= 3 && lessons.length >= 2 * dataset.day + 1) {
          left0 = -dataset.day * 128;
        } else if (dataset.day >= 4 && lessons.length >= 2 * (6 - dataset.day) + 1) {
          left0 = -(7 - dataset.day - lessons.length) * 128;
        }
        e.left = left0 + 128 * i;
      }
      return e;
    });
    lessons.forEach(function (e, i) {
      if (e.target) {
        targetI = i;
        lessons[i].target = false;
      }
    });
    if (!lessons.length) {
      return false;
    }
    _this.setData({
      targetX: dataset.day * 129 + 35 + 8,
      targetY: dataset.wid * 206 + Math.floor(dataset.wid / 2) * 4 + 60 + 8,
      targetDay: dataset.day,
      targetWid: dataset.wid,
      targetI: targetI,
      targetLessons: lessons,
      targetLen: lessons.length,
      blur: true
    });
  },
  hideDetail: function () {
    // 点击遮罩层时触发，取消主体部分的模糊，清空target
    this.setData({
      blur: false,
      targetLessons: [],
      targetX: 0,
      targetY: 0,
      targetDay: 0,
      targetWid: 0,
      targetI: 0,
      targetLen: 0
    });

  },
  infoCardTap: function (e) {
    var dataset = e.currentTarget.dataset;
    if (this.data.targetI == dataset.index) {
      return false;
    }
    this.setData({
      targetI: dataset.index
    });
  },
  infoCardChange: function (e) {
    var current = e.detail.current;
    if (this.data.targetI == current) {
      return false;
    }
    this.setData({
      targetI: current
    });
  },
  chooseView: function () {
    //切换视图(周/学期) *表示学期视图
    this.setData({
      week: this.data.week == '*' ? this.data.toweek : '*'
    });
  },
  returnCurrent: function () {
    //返回本周
    this.setData({
      week: this.data.toweek
    });
  },
  currentChange: function (e) {
    // 更改底部周数时触发，修改当前选择的周数
    var current = e.detail.current
    this.setData({
      week: current + 1
    });
  },
  catchMoveDetail: function () { /*阻止滑动穿透*/ },
  bindStartDetail: function (e) {
    this.setData({
      startPoint: [e.touches[0].pageX, e.touches[0].pageY]
    });
  },
  //滑动切换课程详情
  bindMoveDetail: function (e) {
    var _this = this;
    var curPoint = [e.changedTouches[0].pageX, e.changedTouches[0].pageY],
      startPoint = _this.data.startPoint,
      i = 0;
    if (curPoint[0] <= startPoint[0]) {
      if (Math.abs(curPoint[0] - startPoint[0]) >= Math.abs(curPoint[1] - startPoint[1])) {
        if (_this.data.targetI != _this.data.targetLen - 1) {
          i = 1; //左滑
        }
      }
    } else {
      if (Math.abs(curPoint[0] - startPoint[0]) >= Math.abs(curPoint[1] - startPoint[1])) {
        if (_this.data.targetI != 0) {
          i = -1; //右滑
        }
      }
    }
    if (!i) {
      return false;
    }
    _this.setData({
      targetI: parseInt(_this.data.targetI) + i
    });
  },
  //点击左右按钮切换swiper
  swiperChangeBtn: function (e) {
    var _this = this;
    var dataset = e.currentTarget.dataset,
      i, data = {};
    if (dataset.direction == 'left') {
      i = -1;
    } else if (dataset.direction == 'right') {
      i = 1;
    }
    data[dataset.target] = parseInt(_this.data[dataset.target]) + i;
    _this.setData(data);
  },
  get_kb: function (id) {
    //console.log('课表渲染函数');
    //数组去除指定值
    function removeByValue(array, val) {
      for (var i = 0, len = array.length; i < len; i++) {
        if (array[i] == val) {
          array.splice(i, 1);
          break;
        }
      }
      return array;
    }
    // 根据获取课表
    var _this = this;
    //课表渲染
    function kbRender(_data) {
      var colors = ['green', 'red', 'purple', 'yellow'];
      var i, ilen, j, jlen, k, klen;
      var colorsDic = {};
      var _lessons = _data;
      var _colors = colors.slice(0); //暂存一次都未用过的颜色
      for (i = 0, ilen = _lessons.length; i < ilen; i++) {
        for (j = 0, jlen = _lessons[i].length; j < jlen; j++) {
          for (k = 0, klen = _lessons[i][j].length; k < klen; k++) {
            if (Array.isArray(_lessons[i][j][k])) {
              var y = 0;
              //处理重叠课程
              console.log(_lessons[i][j][k]);
              for (y; y < todaydata.length; y++) {
                if (app.in_array(_lessons[i][j][k][y].weeks)) {
                  break;
                }
              }
              _lessons[i][j][k] = _lessons[i][j][k][y];
            }

            if (_lessons[i][j][k]) {

              // 找出冲突周数,及课程数
              var conflictWeeks = {};
              _lessons[i][j][k].weeks.forEach(function (e) {
                for (var n = 0; n < klen; n++) {
                  if (n !== k && _lessons[i][j][n].weeks.indexOf(e) !== -1) {
                    !conflictWeeks[e] ? conflictWeeks[e] = 2 : conflictWeeks[e]++;
                  }
                }
              });
              _lessons[i][j][k].conflictWeeks = conflictWeeks;
              _lessons[i][j][k].klen = klen;
              _lessons[i][j][k].xf_num = _lessons[i][j][k].xf ? parseFloat(_lessons[i][j][k].xf).toFixed(1) : '';
              // 为课程上色
              if (!colorsDic[_lessons[i][j][k].name]) { //如果该课还没有被上色
                //console.log(_lessons[i][j][k].classNum);
                var iColors = !_colors.length ? colors.slice(0) : _colors.slice(0); // 本课程可选颜色
                if (!_colors.length) { //未用过的颜色还没用过，就优先使用
                  // 剔除掉其上边和左边的课程的可选颜色，如果i!==0则可剔除左边课程颜色，如果j!==0则可剔除上边课程颜色
                  var m, mlen;
                  if (i !== 0) {
                    for (m = 0, mlen = _lessons[i - 1][j].length; m < mlen; m++) {
                      iColors = removeByValue(iColors, _lessons[i - 1][j][m].color);
                    }
                  }
                  if (j !== 0 && _lessons[i][j - 1][k] && _lessons[i][j - 1][k].color) {
                    for (m = 0, mlen = _lessons[i][j - 1].length; m < mlen; m++) {
                      iColors = removeByValue(iColors, _lessons[i][j - 1][m].color);
                    }
                  }
                  // 如果k!==0则剔除之前所有课程的颜色
                  if (k !== 0) {
                    for (m = 0; m < k; m++) {
                      iColors = removeByValue(iColors, _lessons[i][j][m].color);
                    }
                  }
                  //如果为空，则重新补充可选颜色
                  if (!iColors.length) {
                    iColors = colors.slice(0);
                  }
                }
                //剩余可选颜色随机/固定上色
                // var iColor = iColors[Math.floor(Math.random()*iColors.length)];
                var iColor = iColors[0];
                _lessons[i][j][k].color = iColor;
                colorsDic[_lessons[i][j][k].name] = iColor;
                if (_colors.length) {
                  _colors = removeByValue(_colors, iColor);
                }
              } else {
                //该课继续拥有之前所上的色
                //console.log("该课继续拥有之前所上的色"+_lessons[i][j][k].classNum);
                _lessons[i][j][k].color = colorsDic[_lessons[i][j][k].name];
              }
            }
          }
        }
      }
      var today = parseInt(app.today); //0周日,1周一
      today = today === 0 ? 6 : today - 1; //0周一,1周二...6周日
      var week = _this.data.week;
      var lessons = _lessons;
      //各周日期计算
      var nowD = new Date(),
        nowMonth = nowD.getMonth() + 1,
        nowDate = nowD.getDate();
      var dates = _this.data._weeks.slice(0); //0:第1周,1:第2周,..19:第20周
      dates = dates.map(function (e, m) {
        var idates = _this.data._days.slice(0); //0:周一,1:周二,..6:周日
        idates = idates.map(function (e, i) {
          var d = (m === (week - 1) && i === today) ? nowD : new Date(nowD.getFullYear(), nowD.getMonth(), nowD.getDate() - ((week - 1 - m) * 7 + (today - i)));
          return {
            month: d.getMonth() + 1,
            date: d.getDate()
          }
        });
        return idates;
      });
      _this.setData({
        lessons: lessons,
        dates: dates,
        remind: ''
      });
      _this.setData({
        week: '*'
      });
    }

    //读取课表缓存
    var stuclass = id || wx.getStorageSync('stuclass')
    var stuclass = stuclass;
    var strTem = [];
    for (var i = 0; i < 7; i++) {
      var todaydata = [];
      for (var value in stuclass) {
        todaydata[value] = [];
        if (stuclass[value].classes[i] == null) {
          todaydata[value][0] = '';
        } else if (stuclass[value].classes[i] instanceof Array) {
          for (var x in stuclass[value].classes[i])
            todaydata[value][x] = stuclass[value].classes[i][x];
        } else {
          todaydata[value][0] = stuclass[value].classes[i];
        }
      }

      strTem[i] = todaydata;
    }

    //_this.setData({ lessons: strTem});
    kbRender(strTem);

    function todayclass() {
      app.today = parseInt(new Date().getDay());
      //这个today是数组下标，所以减一
      var today = app.today - 1;
      //console.log("目前星期：" + app.today);
      //console.log(stuclass)
      //计算没课节数
      var noclassnum = 0;
      var strTem = {}; // 临时变量
      //周末都是没课滴
      for (var value in stuclass) {
        //console.log("第星期"+today+'第'+value+'节');

        var todaydata = stuclass[value].classes[today];

        var arrayweek = [];
        arrayweek = todaydata.weeks;
        //console.log('arrayweek的值'+arrayweek);
        strTem[value] = {};
        //console.log(arrayweek);
        if (app.in_array(arrayweek)) {
          strTem[value].class = stuclass[value].classes[today];
          strTem[value].classtime = stuclass[value].time;
        } else {
          noclassnum++;
          continue;
        }
      };
      //如果没课的数量是8节那么当天没课
      if (noclassnum == stuclass.length) {
        _this.setData({
          nothingclass: true
        });
      }

    }
  },
  update: function () {
    var date = new Date;
    var year = date.getFullYear();
    var itemlist = ["本学期", year - 1 + "夏", year - 1 + "秋", year + "春", year + "夏", year + "秋"]
    var item = [{}, {
      xn: year - 1,
      xq: 0
    }, {
      xn: year - 1,
      xq: 1
    },
    {
      xn: year - 1,
      xq: 2
    }, {
      xn: year,
      xq: 0
    }, {
      xn: year,
      xq: 1
    },
    ]
    var _this = this;
    wx.showActionSheet({
      itemList: itemlist,
      success: function (res) {
        var params = item[res.tapIndex];
        params.xh = app.jwc.xh
        params.password = app.jwc.password
        wx.showLoading({
          title: '加载中',
        })
        wx.request({
          url: app._server + "/kb",
          data: params,
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          method: "POST",
          success: function (res) {
            res = res.data
            var stuclass = res.data;
            if (params.xn == undefined)
              wx.setStorageSync('stuclass', stuclass);
            _this.get_kb(stuclass);
          },
          fail: function (error) {
            console.log(error)
          },
          complete: function (res) {
            wx.hideLoading();
          }
        });
      }
    })
  }
});