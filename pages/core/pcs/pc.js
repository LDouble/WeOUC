var app = getApp();

Page({
  data: {
    area: [
      '崂山校区',
      '鱼山校区',
      '浮山校区',
      '流亭机场',
      '火车站',
      '火车北站',
      '四方长途汽车站',
      '长途汽车站北站',
      '长途汽车站东站'
    ],
    areaSerial: [
      '崂山校区',
      '鱼山校区',
      '浮山校区',
      '流亭机场',
      '火车站',
      '火车北站',
      '四方长途汽车站',
      '长途汽车站北站',
      '长途汽车站东站'
    ],
    destination: "崂山校区",
    departure: "崂山校区",
    date: "请选择出发日期",
    time: "请选择出发时间",
    wx: "",
    note: "",
    succeed: false
  },

  onLoad: function() {},

  // 更改区域
  bindAreaChange: function(e) {
    var id = e.currentTarget.dataset.id
    var temp = {}
    temp[id] = this.data.area[e.detail.value]
    this.setData(temp);
  },

  bindValueChange: function(e) {
    console.log(e)
    var id = e.currentTarget.dataset.id
    var temp = {}
    temp[id] = e.detail.value
    this.setData(temp);
  },

  checkField: function() {
    var _data = this.data;
    var content
    if (_data.date == "请选择出发日期") {
      content = "请选择日期";
    } else if (_data.time == "请选择出发时间") {
      content = "请选择时间"
    } else if (_data.wx == "") {
      content = "请输入微信"
    } else if (_data.destination == _data.departure) {
      content = "请设置地点"
    } else
      return true;
    wx.showToast({
      title: content,
      image: '/images/common/fail.png',
      duration: 2000
    });
    return false;
  },
  formSubmit: function() {
    if (!this.checkField()) {
      return;
    }
    var _data = this.data;
    var user_token = app.user_token;
    if (!user_token) {
      wx.showToast({
        title: "请先绑定",
        image: '/images/common/fail.png',
        duration: 2000
      });
      return
    }

    // var _projectIndex = _data.projectIndex;
    // var _name = app.store.name || 'wehpu';

    var field = {
      user_token: user_token,
      departure: _data.departure,
      destination: _data.destination,
      date: _data.date,
      time: _data.time,
      wx: _data.wx,
      note: _data.note,
      vehicle_num: _data.vehicle_num
    };
    var _this = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app._server + "/pc",
      data: field,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function(res) {
        res = res.data
        if (res.status == "200") {
          _this.setData({
            succeed: true
          });
          setTimeout(function() {
            wx.navigateBack()
          }, 3000)
          wx.hideLoading()
        }
      },
      fail: function(error) {
        wx.hideLoading()
        wx.showToast({
          title: '提交失败',
          image: '/images/common/fail.png',
          duration: 2000
        });
      },
    });
  },

  // 图片上传
  chooseImage: function() {
    wx.showModal({
      title: '提示',
      showCancel: false,
      content: '添加图片功能即将到来，请耐心等待',
      success: res => {}
    });
    // wx.chooseImage({
    //   sourceType: ['album', 'camera'],
    //   sizeType: ['original', 'compressed'],
    //   count: 1,
    //   success: res => {
    //     console.log(res);
    //     this.setData({
    //       tempImageList: res.tempFilePaths
    //     });
    //   }
    // });
  },
  // 预览图片
  previewImage: function(e) {
    var current = e.target.dataset.src;

    wx.previewImage({
      current: current,
      urls: this.data.tempImageList
    });
  },

  // 更新store和storage
  setStore: function(key, value) {
    if (!key) {
      return;
    }
    app.store[key] = value;
    wx.setStorage({
      key: key,
      data: value
    });
  }
});