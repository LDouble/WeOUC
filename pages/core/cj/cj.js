//cj.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    token: '',
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
    },
    jd:0,
    xf: 0,
  },
  onPullDownRefresh: function () {
    var _this = this;
    _this.setData({ remind: '加载中' });
    this.getkscj();
  },
  onLoad: function(){
    var _this = this;
    if (app.token === ''||app.token ===null) {
     wx.navigateTo({
       url: '/pages/more/login'
     });
   }
    if (wx.getStorageSync('stuinfo')) {
      var stuinfo = wx.getStorageSync('stuinfo')
      app._user.we=stuinfo;
    }else{
      app.getStuinfo()
    }
    _this.setData({
      token: app.token,
      id: app._user.we.xh,
      name: app._user.we.username,
      //point: app._user.we.gradePoint
    });

  },
  onShow : function(){
    var _this = this;
    //判断并读取缓存    
    if (wx.getStorageSync('cj') === ''||wx.getStorageSync('cj') === null) {
      //console.log("onshow cj获取的缓存为空");
      //重定向
      _this.setData({remind:'加载中'});
      this.getkscj();
    }
    else {
      var cj = wx.getStorageSync('cj')

      //console.log(cj);
       _this.setData({'user': {
        'is_bind': true
      }});
      _this.cjRender(cj);
      _this.setData({ remind: '加载中' });
      this.getkscj();

    }
  },
  hb:function(){
    wx.setClipboardData({
    data: '快来领取支付宝跨年红包！打开最新版支付宝就能领取！bs4kcR233A',
    showCancel:false,
  success: function(res) {
    wx.showModal({
      title: '领取成功',
      content: '恭喜你，成功领取红包,请打开支付宝领取',
      success: function (res) {
        //
      }
    })
  }
})
},
  calgpa:function(){
    var cjInfo = this.data.cjInfo;
    var i;
    var credit=0,totaljd=0,xf = 0
    var totalfs = 0,totalxf = 0;
    for(i = 0 ; i < cjInfo.length;i++){
      if(cjInfo[i].selected && cjInfo[i].jd){
          credit += cjInfo[i].xf;
          totaljd += cjInfo[i].jd*cjInfo[i].xf;   
      }
      if(cjInfo[i].selected){
        var tcj = this.cjhs(cjInfo[i].score)
        if(tcj && tcj >= 60){
          totalfs += tcj * cjInfo[i].xf //计算分数
          totalxf += cjInfo[i].xf //计算学分
        }  
      }
      if(cjInfo[i].selected)
           xf += cjInfo[i].xf;
    }
    var jd = 0,aver = 0
    if(credit)
      jd = totaljd / credit;
    else
      jd = 0;  
    if (totalxf)
      aver = totalfs / totalxf;
    this.setData({
      'jd': jd.toFixed(3),
      'xf':xf,
      'aver':aver.toFixed(3)
    })
  },
bindCheckbox: function (e) {
    /*绑定点击事件，将checkbox样式改变为选中与非选中*/
    //拿到下标值，以在cjInfo作遍历指示用
    var index = parseInt(e.currentTarget.dataset.index);
    //原始的icon状态
    var selected = this.data.cjInfo[index].selected;
    var cjInfo = this.data.cjInfo;
    // 对勾选状态取反
    cjInfo[index].selected = !selected;
    // 写回经点击修改后的数组
    this.setData({
      cjInfo: cjInfo
    });
    this.calgpa()
  },
  cjhs:function(cj){
      if(parseFloat(cj)){
        return cj;
      }else{
        return undefined;
      }
  },
bindSelectAll: function () {
  // 环境中目前已选状态
  var selectedAllStatus = this.data.selectedAllStatus;
  // 取反操作
  selectedAllStatus = !selectedAllStatus;
  // 购物车数据，关键是处理selected值
  var cjInfo = this.data.cjInfo;
  // 遍历
  for (var i = 0; i < cjInfo.length; i++) {
    cjInfo[i].selected = selectedAllStatus;
  }
  this.setData({
    selectedAllStatus: selectedAllStatus,
    cjInfo: cjInfo
  });
  this.calgpa()
},
  getkscj : function(){
    var _this=this;
    wx.showNavigationBarLoading();
    wx.request({
      url: app._server + "/oucjw/score",
      method: 'POST',
      header:{"Content-Type": "application/x-www-form-urlencoded" },
      data:{
        username:app.username,
        password:app.password,
      },
      success: function(res){
         if(res.data.status == "200") {
          //console.log(res.data[0].status);
          var _data = res.data.data.reverse()
          console.log(_data)
          //console.log(_data);
          if(_data) {
            //保存成绩缓存
            app.saveCache('cj', _data);
            _this.cjRender(_data);
            _this.bindSelectAll()
          } else
           {
             _this.setData({ remind: '暂无数据' });
            }

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
        //console.warn('网络错误');
      },
      complete: function() {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    })
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
