## WeOUC
```
 WeOUC+小程序，利用Python实现后端，对接中国海大教务处，为本科生提供成绩、课表、自习室等查询服务。
 为了避免误会与麻烦，本分支对小程序前端进行重构，不再基于We重邮的UI进行开发。
 分支past0.1、past0.2分别是基于We重邮开发的分支，目前已废弃。


```
  ![image](https://github.com/LDouble/WeOUC/blob/master/preview.png?raw=true)

## 演示
扫描二维码查看！
 
 ![qr](https://github.com/LDouble/WeOUC/blob/master/gh_9f72ed97eb36_258.jpg?raw=true)

## 鸣谢
感谢以下优秀开源项目,排名不分先后。在开发的过程中，在程序的结构与逻辑上参考了We重邮、We川大。前端UI基于开源框架SC-UI进行开发。

* [We重邮](https://github.com/Lanshan-Studio/wecqupt)
* [We川大](https://github.com/mohuishou/scuplus-wechat)
* [SC-UI](https://github.com/xbup/sc-ui)
* [WeApp-timeTable](https://github.com/st1ven/WeApp-timeTable)

## 功能 ##
- [x] 成绩查询,GPA、加权计算
- [x] 课表查询
- [x] 自习室查询
- [x] 成绩分析
- [x] 成绩调整
- [x] 蹭课
- [x] 拼车
- [ ] 电费
- [ ] 失物招领
- [ ] 校历

## 更新日志 ##
1. 2018.09.07 初步重构前端UI，实现了基础功能:成绩、课表、自习室、成绩分析
2. 2018.09.09 完成课程表重构，实现九宫格。
3. 2019.03.22 对密码进行rsa加密，避免传输过程中被抓包。

## 关于API

> 最近准备秋招了，所以没时间更新API和文档，秋招结束后会针对后端相关编写文档。另外完成其他的功能。
