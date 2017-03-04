//bx.js
//获取应用实例
var app = getApp();
Page({
  data: {
    remind: '加载中',
    count: '-',
    list: [],
    process_state: {
      '未审核': 'waited',
      '请假': 'waited',
      '全勤': 'accepted',
      '旷课': 'dispatched',
      '已完工': 'finished',
      '未知': 'refused'
    }
  },
  //下拉更新
  onPullDownRefresh: function(){
    this.getData();
    wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      });
      wx.stopPullDownRefresh();
  },
  onLoad: function(){
    this.getData();
  },
  getData: function(){
    var that = this;
    if(app.openid==''||app.openid==null){
      that.setData({
        remind: '未绑定'
      });
      console.log('false');
      return false;
    }
    // 发送请求
    wx.request({
      url: app._server + "/mywebapp/kaoqin?openid="+app.openid, 
      method: 'GET',
      success: function(res) {
        console.log(res);
        if(res.data[0].status < 40000) {
          var list = JSON.parse(res.data[0].data);
          console.log(list);
          if(!list || !list.length){
            that.setData({
              'remind': '天呐，你大概在度假吧~~'
            });
          }else{
            for(var i = 0, len = list.length; i < len; i++) {
              var tempstat=list[i].information;
               if(tempstat.indexOf("全勤")!=-1){  
        list[i].state = that.data.process_state['全勤'];  
    }    
    else if(tempstat.indexOf("请假")!=-1){  
        list[i].state = that.data.process_state['请假'];  
    }
    else if(tempstat.indexOf("旷课")!=-1){  
        list[i].state = that.data.process_state['旷课'];  
    } else{
      list[i].state = that.data.process_state['未知'];  
    } 
            }
            that.setData({
              'list': list,
              'count': len,
              'remind': ''
            });
          }
        }else{
          that.setData({
            remind: res.data.message || '未知错误',
            'count': 0
          });
        }
      },
      fail: function(res) {
        app.showErrorModal(res.errMsg);
        that.setData({
          remind: '网络错误',
          'count': 0
        });
      },
      complete: function(){
        wx.stopPullDownRefresh();
      }
    });
  } 
});

