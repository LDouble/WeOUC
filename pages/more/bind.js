// pages/more/bind.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: "jwc",
    types: {
      id: {
        name: "信息门户",
        url: "/id_bind",
        verify: "id_verify",
        password: "id_password",
        help: "密码为统一身份认证平台(即my.ouc.edu.cn)密码，默认密码为身份证后七位前六位,忘记密码可以访问 my.ouc.edu.cn 找回"
      },
      library: {
        name: "图书馆",
        url: "/library/bind",
        verify: "library_verify",
        help: "密码为图书馆的密码，默认密码为身份证后六位,忘记密码可以访问图书馆找回"
      },
      jwc: {
        name: "教务处",
        url: "/bind",
        verify: "jwc_verify",
        password: "jwc_password",
        help: "研究生请使用信息门户认证，密码为本科选课系统的密码，默认密码为学号,忘记密码可以访问选课系统找回"
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.type = options.type || this.type;
    this.setData({
      type: this.type
    })
    this.get_code()
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },
  get_code: function() {
    var that = this;
    wx.login({
      success: function(res) {
        if (res.errMsg == "login:ok") {
          that.code = res.code;
        }
      }
    })
  },
  /**
   *  绑定函数
   */
  bind: function(e) {
    var params = e.detail.value
    if (params.xh.length < 10 || params.password.length < 4) {
      wx.showModal({
        title: '错误提示',
        content: '账号或密码格式不正确'
      })
      return
    }
    params.login_code = this.code
    app.http.post({
      url: app._server + this.data.types[this.type].url,
      params: params
    }).then((data) => {
      if (data.status == "200") { // 
        data = data.data
        wx.setStorageSync("name", data.name)
        wx.setStorageSync("xh", data.xh)
        wx.setStorageSync("user_token", data.user_token)
        wx.setStorageSync("jw_info", data)
        wx.setStorageSync(this.type, params)
        app.remind = "加载中";
        if (this.type == "jwc")
          app.jwc = data;
        else
          app.id = data;
        wx.showToast({
          title: '绑定成功,跳转中',
          duration: 3500,
          success: function() {
            wx.redirectTo({
              url: '/pages/index/index',
            })
          }
        })
      } else {
        wx.showModal({
          title: '绑定提示',
          content: data.message,
        })
      }
    }).catch((error) => {
      wx.showModal({
        title: '请求错误',
        content: error,
      })
    })
    // return app.http.POST(this.types[this.type].url || "/bind", params);
  }
})