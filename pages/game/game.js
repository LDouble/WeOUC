// /pages/game/game.js
var app = getApp()

/**
 * 生成一条聊天室的消息的唯一 ID
 */
function msgUuid() {
  if (!msgUuid.next) {
    msgUuid.next = 0;
  }
  return 'msg-' + (++msgUuid.next);
}

Page({
  /**
     * 聊天室使用到的数据，主要是消息集合以及当前输入框的文本
     */
  data: {
    inputContent: '',
    lastMessageId: 'none',
    stat: "init",
    myinfo: {},
    messages: [],
    user: {},
    openid: '',
    stuinfo: null,
    url: 'wss://wss.yicodes.com',
    remind: '正在连接服务器',
    boy: ['鹿晗', '刘德华', '林峰', 'Jay', '余文乐', '罗志祥', '黄宗泽', '甄子丹'],
    girl: ['蔡依林', '邓紫棋', 'Angelababy', '徐冬冬', '范玮琪', '郭采洁', '徐子珊', '钟嘉欣']
  },
  onLoad: function (options) {
    var _this = this;
    var socketOpen = false
    var socketMsgQueue = []

    if (app.openid === '' || app.openid === null) {
      //console.log("onshow openid获取的缓存为空");
      wx.navigateTo({
        url: '/pages/more/login'
      });
    }
  },

  onReady: function () {
    // 页面渲染完成
    wx.setNavigationBarTitle({ title: '概率ROOM' });

  },

  onShow: function () {
    // 页面显示
    var _this = this
    var userinfo = wx.getStorageSync('userinfo')
    var stuinfo = wx.getStorageSync('stuinfo')
    //console.log(userinfo.userInfo)

    var avatarUrl = userinfo.userInfo.avatarUrl
    var chatinfo = {};
    chatinfo.user = {};
    var sex = parseInt((stuinfo.IDCard).charAt(16))
    sex = (sex % 2) > 0 ? '1' : '2'

    //获取随机昵称
    var nickName = '';
    var ran = Math.floor((Math.random()) * 10 % 7);
    console.log(ran)
    if (sex == 1) {
      nickName = _this.data.boy[ran]
    } else {
      nickName = _this.data.girl[ran]
    }

    var major = stuinfo.major
    major = major.split("(")
    var gradePoint = stuinfo.gradePoint
    var grade = stuinfo.grade

    chatinfo.user.sex = sex;
    chatinfo.user.major = major[0];
    chatinfo.user.gpa = gradePoint;
    chatinfo.user.grade = grade;
    chatinfo.user.openid = app.openid;
    chatinfo.user.nickName = nickName;
    chatinfo.user.avatarUrl = avatarUrl;

    _this.setData({
      myinfo: chatinfo,
      openid: app.openid,
      stuinfo: stuinfo
    })

    

    wx.connectSocket({
      url: _this.data.url,
      // header: {}, // 设置请求的 header
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      success: function (res) {
        console.log("发起socket请求")
        _this.pushMessage(_this.createSystemMessage('正在登录...'));
      },
      fail: function () {
        console.log("失败")
      },
      complete: function () {
        console.log("。。。。")
      }
    })



    //监听WebSocket连接打开事件。
    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！')
      _this.amendMessage(_this.createSystemMessage("登陆成功," + "你叫" + _this.data.myinfo.user.nickName));
      _this.pushMessage(_this.createSystemMessage('正在寻找当前最佳...'));
      socketOpen = true
      //聊天对象的信息

      _this.sendmsg(_this.data.myinfo);
      _this.setData({
        'user': app._user,
        stat: 'connected',
        remind: ''
      })
      console.log('连接服务器成功！')
    })

    //监听WebSocket接受到服务器的消息事件
    wx.onSocketMessage(function (res) {

      var rec = JSON.parse(res.data);
      console.log(rec)

      //系统消息
      if (rec.type == "system") {
        _this.pushMessage(_this.createSystemMessage(rec.content));
        return;
      }

      //聊天消息
      if (rec.type == "speak") {
        var word = rec.content
        var who = rec.user
        _this.pushMessage(_this.createUserMessage(word, who, who.openid == _this.data.openid));
        return;
      }


    })

    //监听WebSocket错误
    wx.onSocketError(function (res) {
      console.log('WebSocket连接打开失败，请检查！')
      _this.setData({
        stat: 'connectfail',
        remind: '服务器连接失败'
      })
      _this.pushMessage(_this.createSystemMessage('连接服务器失败'));
    })

    //监听WebSocket关闭
    wx.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！')
      _this.pushMessage(_this.createSystemMessage('长期未活动，已断开连接'));
    })

  },

 //发送消息
  sendmsg: function (msg) {
    var _this = this;
    var message = JSON.stringify(msg)
    wx.sendSocketMessage({
      data: message ,
      success: function (res) {
        _this.setData({
          inputContent: ''
        })
      },
      fail: function () {
        console.log('fail')
        app.showErrorModal('连接已断开。', '无法发送消息');
      },
      complete: function () {
        // complete
      }
    })
  },
  changeInputContent: function (e) {
    console.log(e.detail.value)
    this.setData({
      'inputContent': e.detail.value
    });
  },

  //用户点击发送消息
  sendmess: function () {
    var _this = this;
    if (_this.data.inputContent.trim() == '') {
      app.showErrorModal('请输入动态内容。', '内容为空');
      return false;
    }
    var inputContent = _this.data.inputContent;
    console.log(inputContent)

    var myinfo = _this.data.myinfo
    var chatinfo = {};
    chatinfo.user = {};
    chatinfo.user.openid = myinfo.user.openid
    chatinfo.user.nickName = myinfo.user.nickName
    chatinfo.user.avatarUrl = myinfo.user.avatarUrl
    chatinfo.type = "speak"
    chatinfo.content = inputContent

    _this.sendmsg(chatinfo)
  },
  onHide: function () {
    // 页面隐藏
    this.quit();
  },
  onUnload: function () {
    // 页面关闭
    this.quit();
  },

  /**
 * 生成聊天室的系统消息
 */
  createSystemMessage: function (content) {
    return { id: msgUuid(), type: 'system', content };
  },



  /**
   * 生成聊天室的聊天消息
   */
  createUserMessage: function (content, user, isMe) {
    console.log('不是wo')
    return { id: msgUuid(), type: 'speak', content, user, isMe };
  },

  /**
     * 替换上一条消息
     */
  amendMessage(message) {
    this.updateMessages(messages => messages.splice(-1, 1, message));
  },

  /**
      * 追加一条消息
      */
  pushMessage: function (message) {
    this.updateMessages(messages => messages.push(message));
  },

  /**
    * 删除上一条消息
    */
  popMessage: function () {
    this.updateMessages(messages => messages.pop());
  },

  /**
    * 退出聊天室
    */
  quit: function () {
    var _this = this;
    var myinfo = _this.data.myinfo
    var chatinfo = {};
    chatinfo.user = {};
    chatinfo.user.openid = myinfo.user.openid
    chatinfo.user.nickName = 
    chatinfo.user.avatarUrl = myinfo.user.avatarUrl
    chatinfo.type = "system"
    chatinfo.content = myinfo.user.nickName + "退出了房间"

    _this.sendmsg(chatinfo)
    wx.closeSocket();
  },

  /**
    * 通用更新当前消息集合的方法
    */
  updateMessages: function (updater) {
    var messages = this.data.messages;
    updater(messages);
    console.log()
    this.setData({ messages });

    // 需要先更新 messagess 数据后再设置滚动位置，否则不能生效
    var lastMessageId = messages.length ? messages[messages.length - 1].id : 'none';
    this.setData({ lastMessageId });
  },
})