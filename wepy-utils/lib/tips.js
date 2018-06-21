const Tips = {
  isLoading: false,

  /**
   * [显示消息提示框（自定义标题与隐藏时间） - wx.showToast]
   * @param {string} [标题内容] [第一个参数，标题内容]
   * @param {int} [持续时间] [第二个参数，持续显示时间，默认是 500ms]
   * TIPS.success([string], [int])
   */

  success: function(title, duration = 500) {
    setTimeout(() => {
      wx.showToast({
        title: title,
        icon: "success",
        mask: true,
        duration: duration
      })
    }, 300)
    if (duration > 0) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, duration)
      })
    }
  },

  /**
   * [显示模态弹窗（第2个参数为 Promise.resolve 是可选项） - wx.showModal]
   * @param {string} [主体内容] [第一个参数，主体内容]
   * @param {string or array or Object} [可选项] [第而个参数，Promise.resolve 是可选项]
   * @param {string} [标题内容] [第三个参数，标题内容]
   * TIPS.confirm([string], [string or array or Object], [string])
   */
  
  confirm: function(text, payload = {}, title = "提示") {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: title,
        content: text,
        showCancel: true,
        success: res => {
          if (res.confirm) {
            resolve(payload)
          } else if (res.cancel) {
            reject(payload)
          }
        },
        fail: res => {
          reject(payload)
        }
      })
    })
  },

  /**
   * [显示消息提示框（可设置ICON，支持隐藏后回调函数） - wx.showToast]
   * @param {string} [标题] [第一个参数，标题内容]
   * @param {Function} [Function] [第二个参数，接收回调函数]
   * @param {string} ['success' or 'loading'] [第三个参数，固定值 'success' 或 'loading']
   * TIPS.toast([string], [Function], ['success' or 'loading'])
   */
  
  toast: function(title, onHide, icon = "success") {
    setTimeout(() => {
      wx.showToast({
        title: title,
        icon: icon,
        mask: true,
        duration: 500
      })
    }, 300)

    // 隐藏结束回调
    if (onHide) {
      setTimeout(() => {
        onHide()
      }, 500)
    }
  },

  /**
   * [显示 loading 提示框（可自定义提示内容，默认显示透明蒙层，防止触摸穿透） - wx.showLoading]
   * @param {string} [文字内容] [显示的文字内容，默认是 加载中]
   * TIPS.loading([string])
   */
  
  loading: function(title = "加载中") {
    if (this.isLoading) {
      return
    }
    this.isLoading = true
    wx.showLoading({
      title: title,
      mask: true
    })
  },

  /**
   * [保留当前页面，跳转到应用内的某个页面 - wx.navigateTo]
   * @param {string} [url] [需要前往的url地址]
   * TIPS.go([string])
   */

  go: function(url) {
    wx.navigateTo({
      url: url
    })
  },

  /**
   * [动态设置当前页面的标题 - wx.setNavigationBarTitle]
   * @param {string} [文字内容] [需要设置的文字标题]
   * TIPS.setTitle([string])
   */

  setTitle: function(title) {
    wx.setNavigationBarTitle({
      title: title
    })
  },

  /**
   * [隐藏 loading 提示框 - wx.hideLoading]
   */
  
  loaded: function() {
    if (this.isLoading) {
      this.isLoading = false
      wx.hideLoading()
    }
  },

  /**
   * [下载并保存单个文件 - wx.downloadFile & wx.saveFile]
   * @param {string} [url] [需要下载的文件地址]
   * TIPS.downloadSaveFile({url:[string],success:[Fuction],fail:[Fuction]})
   */

  downloadSaveFile: function (obj) {
    let that = this
      , success = obj.success
      , fail = obj.fail
      , id = ''
      , url = obj.url

    obj.id ? id = obj.id : id = url

    // 下载文件
    wx.downloadFile({
      url: obj.url,
      success: (res) => {
        // 本地存储文件（本地文件存储的大小限制为 10M）
        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success: (result) => {
            result.id = id
            success(result)
          },
          fail: (e) => {
            console.info("保存一个文件失败")
            fail(e)
          }
        })
      },
      fail: (e) => {
        console.info("下载一个文件失败")
        fail(e)
      }
    })
  },

  /**
   * [下载并保存多个文件]
   * @param {array} [urls] [需要下载的文件地址]
   * @param {boole} [progress] [是否需要返回下载进度]
   * TIPS.downloadSaveFiles({urls:[array],progress:[boole],success:[Fuction],fail:[Fuction]})
   */

  downloadSaveFiles: function (obj) {
    let that = this
      , progress = obj.progress
        // 下载成功
      , success = obj.success
        // 下载失败
      , fail = obj.fail
        // 下载地址 数组，支持多个 url 下载 [url1, url2]
      , urls = obj.urls
        // 创建 Map 实例
      , savedFilePaths = new Map()
        // 有几个url需要下载
      , urlsLength = urls.length
      , count = 100 / urlsLength

    for (let i = 0; i < urlsLength; i++) {
      that.downloadSaveFile({
        url: urls[i],
        success: (res) => {
          // 一个文件下载保存成功
          let savedFilePath = res.savedFilePath

          savedFilePaths.set(res.id, res)

          let step = savedFilePaths.size * count

          // 判断是否需要使用进度
          if (progress) {
            savedFilePaths.step = step
            success(savedFilePaths)
          } else if (!progress && step === 100) {
            success(savedFilePaths)
          }

        },
        fail: (e) => {
          fail(e)
        }
      })
    }
  }

}

// 静态变量，是否加载中 
Tips.isLoading = false

module.exports = Tips
