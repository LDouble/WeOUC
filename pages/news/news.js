//news.js
//获取应用实例
var app = getApp();
Page({
  data: {
    page: 0,
    list: [
      { id: 0, 'type': 'all', name: '头条',storage:[], url: '/blog/getblog.do', enabled: {guest:false, student:true, teacher:true} },
      { id: 1, 'type': 'jw', name: '教务公告',storage:[], url: 'news/jw_list.php', enabled: {guest:false, student:true, teacher:true} },
      { id: 2, 'type': 'oa', name: 'OA公告',storage:[], url: 'news/oa_list.php', enabled: {guest:false, student:true, teacher:true} },
      { id: 5, 'type': 'new', name: '校园周边',storage:[], url: 'news/new_list.php', enabled: {guest:true, student:true, teacher:true} },
    ],
    'active': {
      id: 0,
      'type': 'all',
      data: [],
      showMore: true,
      remind: '上滑加载更多'
    },
    loading: false,
    user_type: 'guest',
    disabledRemind: false
  },
  onLoad: function(){
    if(app._user.is_bind){
      this.setData({
        user_type: !app._user.teacher ? 'student' : 'teacher'
      });
    }else{
      this.setData({
        user_type: 'guest',
        'active.id': 5,
        'active.type': 'new'
      });
    }
    this.setData({
      'loading': true,
      'active.data': [],
      'active.showMore': true,
      'active.remind': '上滑加载更多',
      'page': 0
    });
    this.getNewsList();
  },
  //下拉更新
  onPullDownRefresh: function(){
    var _this = this;
    _this.setData({
      'loading': true,
      'active.data': [],
      'active.showMore': true,
      'active.remind': '上滑加载更多',
      'page': 0
    });
    _this.getNewsList();
  },
  //上滑加载更多
  onReachBottom: function(){
    var _this = this;
    if(_this.data.active.showMore){
      _this.getNewsList();
    }
  },
  //获取新闻列表
  getNewsList: function(typeId){
    var _this = this;
    
    typeId = typeId || _this.data.active.id;
    
    if(!_this.data.page){
      _this.setData({
        'active.data': _this.data.list[typeId].storage
      });
    }
    _this.setData({
      'active.remind': '正在加载中'
    });
    wx.showNavigationBarLoading();
    wx.request({
      url: app._server  + _this.data.list[typeId].url,
      data: {
        blogid: 100120,
        openid: app.openid
      },
      success: function(res){
        console.log(res)
        if(res.data && res.data.status === 20010){
          var blogdata=res.data.data;
          var size=res.data.size
          var lastblogid=res.data.lastblogid;
            _this.setData({
        'loading': true,
        'active.data': blogdata,
        'active.showMore': true,
        'active.remind': '上滑加载更多',
        'page': lastblogid
      });
        wx.showToast({
        title: '更新了'+size+'条数据',
        icon: 'success',
        duration: 2000
      });
        }else{
          if(res.data.status === 40705){
            wx.showToast({
        title: '亲，没有更多数据了噢~~',
        icon: 'success',
        duration: 1500
      });
          _this.setData({
            'active.remind': '已经是最新数据啦'
          });
          }else{
          app.showErrorModal('接口暂时还没有开放');
          _this.setData({
            'active.remind': '待开放的功能'
          });
          }
        }
      },
      fail: function(res){
        app.showErrorModal(res.errMsg);
        _this.setData({
          'active.remind': '网络错误'
        });
      },
      complete: function(){
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
        app.saveCache('blogdata',_this.data.active.data);
        _this.setData({
          loading: false
        });
      }
    });
  },
  //获取焦点
  changeFilter: function(e){
    this.setData({
      'active': {
        'id': e.target.dataset.id,
        'type': e.target.id,
        data: [],
        showMore: true,
        remind: '上滑加载更多'
      },
      'page': 0
    });
    this.getNewsList(e.target.dataset.id);
  }
});