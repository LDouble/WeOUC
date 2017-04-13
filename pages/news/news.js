//news.js
//获取应用实例
var app = getApp();
Page({
  data: {
    page: 0,
    list: [
      { id: 0, 'type': 'all', name: '头条', storage: [], url: '/blog/getblog.do', enabled: { guest: false, student: true, teacher: true } },
      { id: 1, 'type': 'jw', name: '教务公告', storage: [], url: '/blog/getjwblog.do', enabled: { guest: false, student: true, teacher: true } },
      { id: 2, 'type': 'oa', name: 'OA公告', storage: [], url: '/blog/getoablog.do', enabled: { guest: false, student: true, teacher: true } },
      { id: 3, 'type': 'new', name: '校园周边', storage: [], url: '/blog/getnewsblog.do', enabled: { guest: true, student: true, teacher: true } }
    ],
    'active': {
      id: 0,
      'type': 'all',
      data: [],
      showMore: true,
      remind: '下滑加载更多'
    },
    loading: false,
    user_type: 'guest',
    disabledRemind: false
  },
  onLoad: function () {
    if (app.openid) {
      this.setData({
        user_type: !app._user.teacher ? 'student' : 'teacher'
      });
      //console.log("user.is_bind");
    } else {
      this.setData({
        user_type: 'guest',
        'active.id': 3,
        'active.type': 'new'
      });
    }

    this.setData({
      'loading': true,
      'active.data': [],
      'active.showMore': true,
      'active.remind': '下滑加载更多',
    });

    var current_time = wx.getStorageSync('allcurrent_time');
    var nowtime = new Date();
    if (nowtime.getDate() != current_time && nowtime.getHours() >= 3) {
      //console.log('隔日删除缓存');
      wx.removeStorageSync('all');
    }



    var temp_blog_data = wx.getStorageSync('all');
    var temp_lastblogid = wx.getStorageSync('allid');
    if (temp_lastblogid <= 0 || temp_lastblogid == '' || temp_blog_data == '') {
      //console.log("首次使用blog功能")
      this.getNewsList();
    } else {
      //console.log("使用过blog")
      this.setData({
        'loading': false,
        'active.data': temp_blog_data,
        'active.showMore': true,
        'active.remind': '下滑加载更多',
        'page': temp_lastblogid
      });
    }
    //console.log(this.data.active.data);
  },

  //下拉更新
  onPullDownRefresh: function () {
    var _this = this;
    _this.setData({
      'loading': true,
      'active.showMore': true,
      'active.remind': '下滑加载更多',
    });
    _this.getNewsList();
    wx.stopPullDownRefresh();
  },
  //上滑出到底端
  onReachBottom: function () {
    var _this = this;
    _this.setData({
      'active.remind': '————有底线的小程序😆————'
    })
  },
  //获取新闻列表
  getNewsList: function (typeId) {
    var _this = this;
    typeId = typeId || _this.data.active.id;

    var temptype = _this.data.list[typeId].type;
    var tempblog = wx.getStorageSync(temptype);
    var tempblog_size = tempblog.length
    var temp_lastblogid = wx.getStorageSync(temptype + 'id');

    //console.log(tempblog_size);
    //console.log("当前请求的blogid"+_this.data.page);


    //console.log('当前请求的类型' + temptype);
    _this.setData({
      'active.remind': '正在努力加载中'
    });
    wx.showNavigationBarLoading();
    wx.request({
      url: app._server + _this.data.list[typeId].url + '?blogid=' + temp_lastblogid + '&openid=' + app.openid,
      method: 'GET',
      success: function (res) {
        if (res.statusCode == 200) {
          if (temptype == 'all') {
            //记录头条更新日期
            var myDate = new Date();
            if (myDate.getHours() >= 3) {
              app.saveCache('allcurrent_time', myDate.getDate());
              //console.log('写入头条更新时间' + myDate.getDate());
            }

          }
          console.log(res)
          var blogdata = res.data.data;
          var size = res.data.size
          if (size == 0) {
            wx.showToast({
              title: '无更新~',
              icon: 'success',
              duration: 1500
            });
            _this.setData({
              'active.remind': '——没有更多啦😆——',
              'active.data': tempblog,
            });
          } else {
            var j = 0;
            for (var i = size; i < size + tempblog_size; i++) {
              blogdata[i] = tempblog[j];
              j++;
            }
            wx.showToast({
              title: '更新了' + size + '条数据',
              icon: 'success',
              duration: 2000
            });

            app.saveCache(temptype, blogdata);

            _this.setData({
              'active.remind': '————做一个有底线的小程序😆————',
              'active.data': blogdata,
            });
          }

          var lastblogid = res.data.lastblogid;
          if (lastblogid > 0) {
            app.saveCache(temptype + 'id', lastblogid);
            _this.setData({
              'page': lastblogid
            });
          }

          _this.setData({
            'active.showMore': true
          });
        } else {
          _this.setData({
            'active.remind': '网络错误'
          });
        }
      },
      fail: function (res) {
        app.showErrorModal(res.errMsg);
        _this.setData({
          'active.remind': '网络错误'
        });
      },
      complete: function () {
        wx.hideNavigationBarLoading();
        _this.setData({
          loading: false
        });
      }
    })

  },
  //获取焦点
  changeFilter: function (e) {
    this.setData({
      'active': {
        'id': e.target.dataset.id,
        'type': e.target.id,
        data: [],
        showMore: true,
        remind: '下滑加载更多'
      },
      'page': 0
    });

    this.getNewsList(e.target.dataset.id);
  },
  //增加动态
  addnews: function () {
    wx.navigateTo({
        url: '/pages/more/issues'
      });
  }
});