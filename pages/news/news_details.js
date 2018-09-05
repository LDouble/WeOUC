var app = getApp();

Page({
  data: {
    classify: '',
    id: '',
    news: {},
    suffix: '',
    preview: false,
    loading: true,
    pullDownFlag: true,
    fileType: ['doc', 'xls', 'pdf', 'docx', 'xlsx']
  },

  onLoad: function(options) {
    this.data.classify = options.classify;
    this.data.id = options.id;

    this.getNews(this.data.classify, this.data.id);
  },

  // 下拉刷新
  onPullDownRefresh: function() {
      this.getNews(this.data.classify, this.data.id);
  },

  getNews: function(classify, id) {
    // 加载中
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    if (classify && id) {
      wx.request({
        url: app.api + '/rss/' + classify + '/' + id,
        method: 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          Authorization: 'Bearer ' + app.store.token
        },
        success: res => {
          // console.log(res);

          this.setData({
            loading: false
          });

          wx.hideLoading();

          var _requestRes = res.data;
          if (_requestRes.statusCode === 200) {
            var _data = _requestRes.data;

            if (_data.href) {
              // 使用https
              _data.href = _data.href.replace(/http:/, 'https:');

              // 判断是否支持预览
              var _suffix = _data.href.split('.').pop();
              if (
                this.data.fileType.find(elem => {
                  return elem === _suffix;
                })
              ) {
                this.setData({
                  preview: true
                });
              }

              // 修改默认后缀
              switch (_suffix) {
                case 'docx':
                  _suffix = 'doc';
                  break;
                case 'xlsx':
                  _suffix = 'xls';
                  break;
                case 'doc':
                  break;
                case 'xls':
                  break;
                case 'pdf':
                  break;
                default:
                  _suffix = 'file';
                  break;
              }
              this.setData({
                suffix: _suffix
              });
            }

            this.setData({
              news: _data
            });

            // 更新导航标题
            wx.setNavigationBarTitle({
              title: this.data.news.title
            });
          } else if (_requestRes.statusCode === 404) {
            this.setData({
              loading: false
            });
          } else {
            wx.showToast({
              title: '新闻走丢了',
              image: '/images/common/fail.png',
              duration: 2000
            });
          }
        },
        fail: () => {
          wx.hideLoading();
          wx.showToast({
            title: '新闻走丢了',
            image: '/images/common/fail.png',
            duration: 2000
          });
        },
        complete: () => {
          wx.stopPullDownRefresh();
          this.data.pullDownFlag = true;
        }
      });
    } else {
      this.setData({
        loading: false
      });
      wx.showToast({
        title: '新闻走丢了',
        image: '/images/common/fail.png',
        duration: 2000
      });
    }
  },

  // 预览文件
  openDocument: function() {
    wx.downloadFile({
      url: this.data.news.href,
      success: res => {
        var filePath = res.tempFilePath;
        wx.openDocument({
          filePath: filePath,
          success: () => {},
          fail: () => {
            wx.showToast({
              title: '打开失败',
              image: '/images/common/fail.png',
              duration: 2000
            });
          }
        });
      },
      fail: () => {
        wx.showToast({
          title: '加载失败',
          image: '/images/common/fail.png',
          duration: 2000
        });
      }
    });
  },

  // 下载文件
  handleCopy: function() {
    wx.setClipboardData({
      data: this.data.news.href,
      success: res => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success',
          duration: 2000
        });
      }
    });
  }
});