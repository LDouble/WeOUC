# 微信小程序 WePy Utils

微信小程序 WePy 工具集整合并封装了常用的小程序 API 和 HTTP Request 持续更新中...

## 安装

```bash
npm install wepy-utils
```

## 按需引入

```javascript
import { UTILS, HTTP, TIPS } from 'wepy-utils'
```

## Utils

##### `UTILS.now()`

> 获取当前时间戳

```javascript
let now = UTILS.now()
console.log(now)
```

##### `UTILS.random()`

> 返回任意区间随机数

```javascript
let random = UTILS.random(1, 5)
console.log(random)
```

## HTTP Request

> `GET` `POST` `PATCH` `PUT` `DELETE`

##### `HTTP.get()`


> 第1种使用方法是URL不带参数。第2种使用方法是在请求URL后带参数，如：`?id=1&name=ming`

- `HTTP.get(url).then((data) => {}).catch((error) => {})`
- `HTTP.get({url: url, params: [JSON Object] }).then((data) => {}).catch((error) => {})`

```javascript
let url = 'urlpath'
HTTP.get({
  url: url,
  params: {id: 1, name: 'ming'}
}).then((data) => {
  console.log(data)
}).catch((error) => {
  console.log(error)
})
```

##### `HTTP.post()`

> 可自定义 headers，如需 `Authorization` 等，默认：`'Content-Type': 'application/json'`

```javascript
HTTP.post({
  url: url, params: {id: 1, name: 'ming' },
  headers: {'X-Requested-With': 'XMLHttpRequest'}
}).then((data) => {
  console.log(data)
}).catch((error) => {
  console.log(error)
})
```

##### `HTTP.patch()` `HTTP.put()` `HTTP.delete()` 请求方式与 `HTTP.post()` 写法类似

```javascript
// HTTP PATCH
HTTP.patch({url: url, params: [JSON Object], headers: [JSON Object] }).then((data) => {}).catch((error) => {})
// HTTP PUT
HTTP.put({url: url, params: [JSON Object], headers: [JSON Object] }).then((data) => {}).catch((error) => {})
// HTTP DELETE
HTTP.delete({url: url, params: [JSON Object], headers: [JSON Object] }).then((data) => {}).catch((error) => {})
```

## Tips

##### `TIPS.success()`

> 显示消息提示框（自定义标题与隐藏时间）

```
TIPS.success('这是一个标题', 1000)
```

##### `TIPS.confirm()`

> 显示模态弹窗（第2个参数为 Promise.resolve 是可选项）

```javascript
TIPS.confirm('文字内容', [1,2,3], '标题内容').then((arr) => {
  console.log('点击了确定', arr[2]); // 3
}).catch(() => {
  console.log('点击了取消')
})
```

##### `TIPS.toast()`

> 显示消息提示框（可设置ICON，支持隐藏后回调函数）

```javascript
TIPS.toast('标题', () => {
  console.log('隐藏时执行回调')
}, 'loading')
```

##### `TIPS.go()`

> 保留当前页面，跳转到应用内的某个页面

```javascript
TIPS.go('test?id=1')
```

##### `TIPS.setTitle()`

> 动态设置当前页面的标题

```javascript
TIPS.setTitle('Hello WePy')
```

##### `TIPS.loading()`

> 显示 loading 提示框，可自定义提示内容，默认显示透明蒙层，防止触摸穿透

```javascript
TIPS.loading('加载标题')
```

##### `TIPS.loaded()`

> 隐藏 loading 提示框

```javascript
TIPS.loaded()
```

##### `TIPS.downloadSaveFile()`

> 下载单个文件

```javascript
let url = 'url'
TIPS.downloadSaveFile({
  url: url,
  success: (res) => {
    console.log(res)
  },
  fail: (err) => {
    console.log(err)
  }
})
```

##### `TIPS.downloadSaveFiles()`

> 下载多个文件

```javascript
let urls = ['url1','url2','url3']
TIPS.downloadSaveFiles({
  urls: urls,
  progress: true,
  success: (res) => {
    // 下载进度（如果设置 progress: false 数据将在全部下载完成后返回）
    console.log(`下载进度:${res.step}%`)
    // 全部加载完成
    if (res.step === 100) {
      console.log(res)
      res.forEach((value, key) => {
        console.log(`Key:${key} = Value:${value.savedFilePath}`)
      })
    }
  },
  fail: (err) => {
    console.log(err)
  }
})
```