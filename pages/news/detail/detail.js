//detail.js (common)
var app = getApp();
module.exports.ipage = {
  data: {
    remind: "",
    id: "",
    title: "",    // 新闻标题
    date: "",     // 发布日期
    author: "",   // 发布作者
    reading: "",   // 阅读量
    content: "",  // 新闻内容
    files_len: 0,  // 附件数量
    files_list: [],
    file_loading: false, //下载状态
    source: '',   // 附件来源
    sources: {
      'jw': '教务在线',
      'oa': 'OA系统',
      'hy': 'OA系统',
      'jz': 'OA系统',
      'new': '新闻中心'
    }
  },
  //分享
  onShareAppMessage: function () {
    var _this = this;
    return {
      title: _this.data.title,
      desc: 'We华软 - 资讯详情',
      path: 'pages/news/'+_this.data.type+'/'+_this.data.type+'_detail?type='+_this.data.type+'&id='+_this.data.id
    }
  },

  convertHtmlToText: function(inputText){
    var returnText = "" + inputText;
    returnText = returnText.replace(/<\/?[^>]*>/g, '').replace(/[ | ]*\n/g, '\n').replace(/ /ig, '')
                  .replace(/&mdash/gi,'-').replace(/&ldquo/gi,'“').replace(/&rdquo/gi,'”');
    return returnText;
  },
  
  onLoad: function(options){
    var _this = this;
      _this.contentHandler(options);
  },
  contentHandler: function(options){
    var _this = this;
    var id=options.id;
    var content=wx.getStorageSync('blogdata');
    content=content[id];
    _this.setData({
      'type': options.type,
      id: options.id,
      title: content.blogid,
      author: content.nickname,
      date: content.pubtime,
      content: content.pubissue
    });
    
  }
};