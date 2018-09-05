var app = getApp();
var page = {
  jwc:1,
  hq:1
};
Page({
  data: {
    // 分类标签
    classify: [{
      id: 'jwc',
      name: '教务处'
    },
    {
      id: 'hq',
      name: '后勤'
    },
    // {
    //   id: 'xs',
    //   name: '讲座'
    // },
      // {
      //   id: 'notice',
      //   name: '公告'
      // },
      // {
      //   id: 'library',
      //   name: '图书馆'
      // }
    ],
    // 当前选中
    classifyActived: 'jwc',
    // 缓存结果状态
    newsList: {
      jwc: {
        start: 0,
        empty: false,
        list: []
      },
      hq: {
        start: 0,
        empty: false,
        list: []
      },
      lecture: {
        start: 0,
        empty: false,
        list: []
      },
      notice: {
        start: 0,
        empty: false,
        list: []
      },
      library: {
        start: 0,
        empty: false,
        list: []
      }
    },
    // 每次请求数
    perCount: 5,
    pullDownFlag: true
  },

  onLoad: function () {
    this.getRss(this.data.classifyActived);
  },

  // 上拉加载更多
  onReachBottom: function () {
    setTimeout(() => {
      this.loadMoreRss(this.data.classifyActived);
    }, 1000);
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    var _pullDownFlag = this.data.pullDownFlag;

    if (_pullDownFlag) {
      var _classifyActived = this.data.classifyActived;

      page[_classifyActived] = 1;
      this.data.newsList[_classifyActived].list = [];

      this.getRss(_classifyActived);
    }
  },

  // 获取新闻
  getRss: function (id) {
    // 加载中
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    app.http.post({
      url: "https://oucjw.it592.com/news/lists",
      params: {
        type: id,
        page: page[id]
      }
    }).then((res) => {
      console.log(res.status)
      if (res.status === 200) {
        var classify = this.data.newsList[id].list;
        var _classify = 'newsList.' + id + '.list';
        // 更新结果数组
        classify.push.apply(classify, res.data);
        this.setData({
          [_classify]: classify
        });
        console.log(classify)
        page[id]++;
      } else if (res.status === 404) {
        emptyFlag = true;

        this.setData({
          [_emptyFlag]: emptyFlag
        });
        wx.showToast({
          title: '无更多新闻',
          image: '/images/common/fail.png',
          duration: 2000
        });
      }
      wx.stopPullDownRefresh()
    }).catch((error)=>{
      console.log(error)
      wx.showToast({
        title: '无更多新闻',
        image: '/images/common/fail.png',
        duration: 2000
      });
      wx.stopPullDownRefresh()
    })
  },

  // 加载更多
  loadMoreRss: function (id) {
    this.data.newsList[id].start += this.data.perCount;
    this.getRss(id);
  },

  // 切换分类
  changeClassify: function (e) {
    var id = e.currentTarget.id;

    if (this.data.classifyActived === id) {
      return;
    } else {
      // 更新视图
      this.setData({
        classifyActived: id
      });
    }

    // 屏蔽多余请求
    if (this.data.newsList[id].list.length) {
      return;
    } else {
      this.getRss(id);
    }
  }
});