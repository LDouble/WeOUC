// pages/more/bind.js
var app = getApp();
var RSA = require('../../utils/wxapp_rsa.js')
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
    this.type = options.type || this.data.type;
    console.log(this.data.type)
    this.setData({
      type: this.type
    })
    this.get_code()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // 在页面中定义插屏广告
    let interstitialAd = null

    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-f352d643d0b09c03'
      })
      interstitialAd.onLoad(() => { })
      interstitialAd.onError((err) => { })
      interstitialAd.onClose(() => { })
    }

    // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }
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
    var _this = this
    wx.showLoading({
      title: '加载中',
    })
    var publicKey_pkcs1 = '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC6Qy3ymw7vaTF1CLm+V0NTZaBRnIH9vYoQgVU4GDKF4W3vGkDmE7PdWwk3hPuNE4ypDdBqhG0qqksNCtNrlo2WPp+RXCrRw7HxYT0mmC+e96Wofoz3JfeWfP9eCYKM0NgvZBzRepy92GewayyARfebLf1co5f2YUOLisQQFzlCqQIDAQAB-----END PUBLIC KEY-----'
    var encrypt_rsa = new RSA.RSAKey();
    encrypt_rsa = RSA.KEYUTIL.getKey(publicKey_pkcs1);
    var encStr = encrypt_rsa.encrypt(params.password)
    params.password = encStr
    params.type = "base64"
    wx.request({
      url: app.server + this.data.types[this.type].url,
      data: params,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: "POST",
      success: function(res) {
        var data = res.data
        if (data.status == "200") { // 
          data = data.data
          wx.setStorageSync("name", data.name)
          wx.setStorageSync("xh", data.xh)
          wx.setStorageSync("user_token", data.user_token)
          wx.setStorageSync("jw_info", data)
          wx.setStorageSync(_this.type, params)
          app.remind = "update";
          app.user_token = data.user_token
          if (_this.type == "jwc")
            app.jwc = data;
          else
            app.id = data;
          wx.hideLoading();
          wx.showToast({
            title: '绑定成功,跳转中',
            duration: 1500,
            success: function() {
              wx.reLaunch({
                url: '/pages/index/index',
              })
            }
          })
        } else {
          wx.hideLoading();
          wx.showModal({
            title: '绑定提示',
            content: data.message,
          })
          _this.get_code()
        }
      },
      fail: function(error) {
        wx.hideLoading();
        wx.showModal({
          title: '请求错误',
          content: error,
        })
        _this.get_code()
      },
      complete: function(res) {}
    });
    // return app.http.POST(this.types[this.type].url || "/bind", params);
  }
})