//cj.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    clickcj: '',
    help_status: false,
    cjInfo : [

    ],
    xqNum : {
      grade: '',
      semester: ''
    },
    xqName : {
      grade: '',
      semester: ''
    }
  },
  onLoad: function(){
    var _this = this;
    if (wx.getStorageSync('stuinfo')) {
      var stuinfo = wx.getStorageSync('stuinfo')
      app._user.we=stuinfo;
    }else{
      app.showErrorModal('建议打开个人信息页面查看个人信息', '个人信息获取异常')
    }
     if (app.openid === ''||app.openid ===null) {
      console.log("onshow openid获取的缓存为空");
      wx.navigateTo({
        url: '/pages/more/login'
      });
    }
    _this.setData({
      id: app._user.we.num,
      name: app._user.we.name,
      point: app._user.we.gradePoint
    });
    //判断并读取缓存
    if (wx.getStorageSync('cj') === '') {
      console.log("onshow cj获取的缓存为空");
      //重定向
      _this.setData({remind:'加载中'});
      this.getkscj();  
    }
    else {
      var cj = wx.getStorageSync('cj')
      
      console.log(cj);
       _this.setData({'user': {
        'is_bind': true
      }});
      _this.cjRender(cj);
      
    }

  },
  getkscj : function(){
    var _this=this;
    wx.showNavigationBarLoading();
    wx.request({
      url: app._server + "/mywebapp/chengji?openid="+app.openid,
      method: 'GET',
      success: function(res) {
        if(res.data[0].status < 40000) {
          
          var _data = JSON.parse(res.data[0].data);
          console.log(_data);
          if(_data) {
            //保存成绩缓存
            app.saveCache('cj', _data);
            _this.cjRender(_data);
          } else { _this.setData({ remind: '暂无数据' }); }

        } else {
          app.removeCache('cj');
          _this.setData({
            remind: res.data.message || '未知错误'
          });
        }

      },
      fail: function(res) {
        if(_this.data.remind == '加载中'){
          _this.setData({
            remind: '网络错误'
          });
        }
        console.warn('网络错误');
      },
      complete: function() {
        wx.hideNavigationBarLoading();
      }
    });
  },
  cjRender : function(_data){
      var _this=this;
      _this.setData({
        cjInfo: _data,
        remind: ''
      });
    },
  tapHelp: function (e) {
    if (e.target.id == 'help') {
      this.hideHelp();
    }
  },
  showHelp: function (e) {
    var id=e.target.id;
    this.setData({
      'clickcj': this.data.cjInfo[id],
      'help_status': true
    });
  },
  hideHelp: function (e) {
    this.setData({
      'help_status': false
    });
  }
});