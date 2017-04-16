//detail.js (common)
var app = getApp();
module.exports.ipage = {
    data: {
        remind: "",
        settitle: "",
        id: "",
        type: "",
        title: "",    // 新闻标题
        data: "",     // 发布日期
        author: "",   // 发布作者
        reading: "",   // 阅读量
        content: "",  // 新闻内容
        files_len: 0,  // 附件数量
        typeid: '', // 对应blog内容在数据库中的id
        files_list: [],
        file_loading: false, //下载状态
        source: '',   // 附件来源
        sources: {
            'jw': '教务在线',
            'oa': 'OA系统',
            'hy': 'OA系统',
            'jz': 'OA系统',
            'new': '新闻中心'
        },
        liked: null, // 是否点赞
        likeCount: 0,  // 点赞数量
        commentCount: 0, // 评论量
        readCount: 0,  // 阅读量
        wOptions: null, // 
        isProcessing: false, // 是否正在处理

        // 评论
        comments: null,

        // 提示消息
        msg: ''
    },
    //分享
    onShareAppMessage: function () {
        var _this = this;
        return {
            title: _this.data.title,
            desc: 'We华软 - 资讯详情',
            path: 'pages/news/' + _this.data.type + '/' + _this.data.type + '_detail?type=' + _this.data.type + '&id=' + _this.data.id
        }
    },

    convertHtmlToText: function (inputText) {
        var returnText = "" + inputText;
        returnText = returnText.replace(/<\/?[^>]*>/g, '').replace(/[ | ]*\n/g, '\n').replace(/ /ig, '')
            .replace(/&mdash/gi, '-').replace(/&ldquo/gi, '“').replace(/&rdquo/gi, '”');
        return returnText;
    },

    onLoad: function (options) {
        var _this = this;
        _this.contentHandler(options);
        _this.setData({
            'wOptions': options
        })
    },
    onShow: function () {
        this.addReadCount(this.data.typeid,
            this.data.type == 'all' ? 'blog' : this.data.type);

        var blogContents = wx.getStorageSync(this.data.type);
        var blogContent = blogContents[this.data.id];
        this.setData({
            liked: blogContent.liked
        });

        // 获取评论
        this.getComments();
    },
    contentHandler: function (options) {
        var _this = this;
        var id = options.id;
        var type = options.type;
        var content = wx.getStorageSync(type);
        content = content[id];
        _this.setData({
            'type': options.type,
            id: options.id,
            typeid: content.blogid,
            title: content.title,
            author: content.nickname,
            date: content.pubtime,
            content: content.pubissue,
            liked: content.liked,
            likeCount: content.likeCount,
            readCount: content.readCount,
            commentCount: content.commentCount
        });
    },
    // 增加阅读量
    addReadCount: function (id, type) {
        // 编辑请求参数
        var optionsArr = [
            { 'key': 'openid', 'value': app.openid },
            { 'key': 'id', 'value': id },
            { 'key': 'type', 'value': type },
        ];
        this.sendCommonRequest('read.do', optionsArr);
    },
    // 处理点赞
    processLike: function () {
        var _this = this;

        if (_this.data.isProcessing == true) {
            wx.showToast({
                title: '手速太快啦~',
                icon: 'loading',
                duration: 500
            })
            return;
        }

        var methodValue = '';
        if (_this.data.liked == false) {
            methodValue = 'add';
        }
        else {
            methodValue = 'del';
        }

        _this.setData({
            isProcessing: true
        });
        var timestap = Date.parse(new Date());
        wx.request({
            url: app._server + '/blog/like.do?timestap=' + timestap,
            data: {
                openid: app.openid,
                likeid: _this.data.typeid,
                type: _this.data.type == 'all' ? 'blog' : _this.data.type,
                nickname: app._user.wx.nickName,
                method: methodValue
            },
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {

                if (res.data.status == 20010) {
                    console.log(res);
                    _this.setData({
                        liked: !_this.data.liked
                    });
                    console.log("3" + _this.data.liked);
                    // 修改本地缓存
                    var blogContents = wx.getStorageSync(_this.data.type);
                    blogContents[_this.data.id].liked = _this.data.liked;
                    if (blogContents[_this.data.id].liked == true) {
                        _this.setData({
                            likeCount: _this.data.likeCount + 1
                        });
                        blogContents[_this.data.id].likeCount++;
                    }
                    else {
                        _this.setData({
                            likeCount: _this.data.likeCount - 1
                        });
                        blogContents[_this.data.id].likeCount--;
                    }
                    wx.setStorageSync(_this.data.type, blogContents);
                }
                else {
                    console.log(res);
                }
                _this.setData({
                    isProcessing: false
                });
            },
            fail: function (res) {
                console.log(res);
                _this.setData({
                    isProcessing: false
                });
            }
        });
    },
    // 发送普通请求（不需要处理返回参数）
    sendCommonRequest: function (file, options) {
        var _this = this;
        var urlOptions = '';

        if (options != null) {
            urlOptions += this.processUrlOption(options);
        }
        wx.request({
            url: app._server + '/blog/' + file + urlOptions,
            method: 'GET',
            success: function (res) {

                if (res.data.status == 20010) {
                    console.log(res);
                }
                else {
                    console.log(res);
                }
            },
            fail: function (res) {
                console.log(res);
            }
        })
    },
    // 处理参数
    processUrlOption: function (options) {
        var optionsStr = '?';
        for (var i = 0; i < options.length; i++) {
            optionsStr += options[i].key + '=' + options[i].value +
                '&';
        }
        optionsStr = optionsStr.substring(0, optionsStr.length - 1);
        return optionsStr;
    },
    // 添加评论
    addComment: function () {
        var _this = this;
        wx.navigateTo({
            url: '/pages/news/detail/issuesComment?type=' + _this.data.type + '&id=' + _this.data.typeid
        });
    },

    // 获取评论
    getComments: function () {
        var _this = this;
        // 构建请求参数
        var optionsArr = [
            { 'key': 'openid', 'value': app.openid },
            { 'key': 'id', 'value': _this.data.typeid },
            { 'key': 'type', 'value': _this.data.type == 'all' ? 'blog' : _this.data.type }
        ];
        var urlOptions = '';
        urlOptions += _this.processUrlOption(optionsArr);

        var timestap = Date.parse(new Date());
        wx.showNavigationBarLoading();
        wx.request({
            url: app._server + '/blog/getcomment.do' + urlOptions + '&timestap=' + timestap,
            method: 'GET',
            success: function (res) {

                if (res.data.status == 20010) {
                    console.log(res);
                    // 重新设置评论数
                    var size = res.data.size;
                    _this.setData({
                        commentCount: size
                    })
                    // 修改本地缓存
                    var blogContents = wx.getStorageSync(_this.data.type);
                    blogContents[_this.data.id].commentCount = size;
                    wx.setStorageSync(_this.data.type, blogContents);

                    _this.setData({
                        'comments': res.data.data
                    });
                    console.log(_this.data.comments);
                    _this.setData({
                        msg: '——没有更多啦😆——'
                    })
                }
                else if (res.data.status == 40716) {
                    _this.setData({
                        msg: '——没有评论啦😆——'
                    })
                }
                else {
                    console.log(res);
                }
            },
            fail: function (res) {
                console.log(res);
            },
            complete: function () {
                wx.hideNavigationBarLoading();
                _this.setData({
                    loading: false
                });
            }
        })
    },
    addReplyComment: function (obj) {
        var _this = this;
        wx.navigateTo({
            url: '/pages/news/detail/issuesReplyComment?type=comment' + '&id=' + obj.target.id
        });
    }
};