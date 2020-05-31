---
title: cookie
date: 2020-03-20 20:27:08
tags:
---

为解决HTTP无状态导致的问题，出现了cookie。但Cookie的存在也不是为了解决通讯协议无状态的问题，只是为了解决客户端与服务端会话状态的问题，这个状态是指后端服务的状态而非通讯协议的状态。

## Cookie介绍
Cookie（复数形式为Cookies），类型为[小型文本文件]，指某些网站为了辨别用户身份而储存在用户本地终端上的数据。
作为一段一般不超过4kb的小型文本数据，它有一个名称（Name），一个值（Value）和其他几个用于控制Cookie有效期、安全性、使用范围的可选属性组成。

Cookie文件不仅可以保存在浏览器中还可以保存在存放在本地文件中，这样的好处是即使关闭了浏览器，Cookie依然可以生效。

## Cookie的保质期
有永久的也有临时的，每个浏览器都含有自己的Cookie，每次请求的时候都会根据domain来发送相应的Cookie，可通过设置expries、max-age来设定保存日期，不设置的话默认是临时存储，即关闭浏览器就消失。

## 满足同源策略
虽然网站images.google.com和网站www.google.com同属Google，但是域名不一样，二者同样不能相互操作彼此的Cookie。而且path也必须一样才能相互访问彼此的Cookie。需要注意不同浏览器对path的访问规定不一样，对于chorme，path必须为当前目录，设置为其他目录无效，**只能当前页面访问当前目录及以上的cookie**

## Cookie的设置
1.客户端发送HTTP请求到服务器
2.当服务器收到HTTP请求时，在响应头里添加一个Set-Cookie字段
3.浏览器收到响应后保存在Cookie
4.之后对该服务器每一次请求中都通过Cookie字段将Cookie信息发送给服务器。

## 前端使用cookie操作cookie
```js
// 示例
document.cookie='name=xiaoming;expires='+oDate
```

## Cookies的属性
1.name字段：一个cookie的名称
2.value字段：一个cookie的值
### Expires
Expires用于设置Cookie时间。比如
```js
Set-Cookie: id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT;
```
当Expires属性缺省时，表示是绘画性Cookie，例如，当Expires属性的值为Session，表示的就是绘画性Cookie。党委绘画性Cookie的时候，值保存在客户端内存中，并在用户关闭浏览器时失效。需要注意的是，有些浏览器提供了会话恢复功能，这种情况下即使关闭了浏览器，会话期Cookie也会被保留下来。
与会话性Cookie相对的是持久性Cookie，持久性Cookies会保存在用户的硬盘中，直至过期或者清除Cookie。值得注意的是，设定的日期和事件至于客户端相关，而不是服务端。

### max-age
max-age用于设置在Cookie失效之前需要经过的秒数
```js
Set-Cookie: id=a3fWa; Max-Age=604800;
```
max-age可以为正数，负数，甚至是0
如果max-age属性为正数时，浏览器会将其持久化，即写到对应的Cookie文件中
当max-age属性为负数，则表示Cookie只是一个会话性Cookie
当max-age为0时，则会立即删除这个Cookie
假如max-age和expires都存在，max-age优先级更高

### domain
domain指定了Cookie可以送达的主机名。假如没有指定，那么默认值为当前文档访问地址中的主机部分（但不包含子域名）
想淘宝首页设置的domain就是.taobao.com，这样无论是a.taobao.com还是b.taobao.com都可以使用Cookie
这里需要注意的是，不能跨域设置Cookie，比如阿里域名下的页面把domain设置成百度是无效的

### path
path指定了一个URL路径，这个路径必须出现在要请求的资源的路径中才可以发送Cookie首部。
比如设置**Path=/docs，/docs/Web/下的资源才会带Cookie首部，/test则不会懈怠Cookie首部
domain和path标示共同定义了Cookie的作用域：即Cookie该发送给哪些URL

### Secure属性
标记为Secure的Cookie只应通过被HTTPs协议吉阿米果的请求发送给服务端。使用HTTPs安全协议，可以保护Cookie在浏览器和Web服务器间的传输过程不被窃取和篡改。

### HTTPOnly
设置HTTPOnly属性可以防止客户端脚本通过document.cookie等方式访问Cookie，有助于避免XSS攻击。

### SameSite

作用
SameSite属性可以让Cookie在跨站请求时不会被发送，从而可以组织跨站请求伪造攻击（CSRF）

属性值
SameSite可以有下面三种值
1.Strict：仅允许一方请求懈怠Cookie，即浏览器将只发送相同站点请求的Cookie，即当前网页URL与请求目标URL完全一致。
2.Lax：允许比分第三方请求懈怠Cookie
3.None： 无论是否跨站都会发送Cookie

之前默认是None的，Chorme80后默认是Lax

### 跨域和跨站

首先要理解的一点就是跨站和跨域是不同的。同站（same-site）、跨站（cross-site）和第一方（first-party）、第三方（third-party）是等价的。但是与浏览器同源策略（SOP）中的同源（same-origin）、跨域（corss-origin）是完全不同的概念。

同源策略的同源是指两个URL的协议、主机名、端口一致。
同源策略作为浏览器的安全基石，其同源判断是比较严格的，相对而言，Cookie中的同站判断就比较宽松：只要两个URL的eTLD+1相同即可，不需要考虑协议和端口。其中，eTLD表示有效顶级域名，注册于Mozilla维护的公共后缀列表中。例如.come,.co.uk,.github.io等。eTLD+1则表示，有效顶级域名+二级域名。例如taobao.com等。

举几个例子，www.taobao.com 和 www.baidu.com 是跨站，www.a.taobao.com 和 www.b.taobao.com 是同站，a.github.io 和 b.github.io 是跨站(注意是跨站)。

### 由此带来的改变

**此处有图**
从上图可以看出，对大部分 web 应用而言，Post 表单，iframe，AJAX，Image 这四种情况从以前的跨站会发送三方 Cookie，变成了不发送。
Post表单：应该的，学 CSRF 总会举表单的例子。
iframe：iframe 嵌入的 web 应用有很多是跨站的，都会受到影响。
AJAX：可能会影响部分前端取值的行为和结果。
Image：图片一般放 CDN，大部分情况不需要 Cookie，故影响有限。但如果引用了需要鉴权的图片，可能会受到影响。
除了这些还有 script 的方式，这种方式也不会发送 Cookie，像淘宝的大部分请求都是 jsonp，如果涉及到跨站也有可能会被影响。

## 带来问题
我们再看看会出现什么的问题？举几个例子：

天猫和飞猪的页面靠请求淘宝域名下的接口获取登录信息，由于 Cookie 丢失，用户无法登录，页面还会误判断成是由于用户开启了浏览器的“禁止第三方 Cookie”功能导致而给与错误的提示

淘宝部分页面内嵌支付宝确认付款和确认收货页面、天猫内嵌淘宝的登录页面等，由于 Cookie 失效，付款、登录等操作都会失败

阿里妈妈在各大网站比如今日头条，网易，微博等投放的广告，也是用 iframe 嵌入的，没有了 Cookie，就不能准确的进行推荐

一些埋点系统会把用户 id 信息埋到 Cookie 中，用于日志上报，这种系统一般走的都是单独的域名，与业务域名分开，所以也会受到影响。

一些用于防止恶意请求的系统，对判断为恶意请求的访问会弹出验证码让用户进行安全验证，通过安全验证后会在请求所在域种一个Cookie，请求中带上这个Cookie之后，短时间内不再弹安全验证码。在Chrome80以上如果因为Samesite的原因请求没办法带上这个Cookie，则会出现一直弹出验证码进行安全验证。

天猫商家后台请求了跨域的接口，因为没有 Cookie，接口不会返回数据


### 解决方案
解决方案就是设置 SameSite 为 none。
不过也会有两点要注意的地方：

1.HTTP 接口不支持 SameSite=none
如果你想加 SameSite=none 属性，那么该 Cookie 就必须同时加上 Secure 属性，表示只有在 HTTPS 协议下该 Cookie 才会被发送。

2.需要 UA 检测，部分浏览器不能加 SameSite=none
IOS 12 的 Safari 以及老版本的一些 Chrome 会把 SameSite=none 识别成 SameSite=Strict，所以服务端必须在下发 Set-Cookie 响应头时进行 User-Agent 检测，对这些浏览器不下发 SameSite=none 属性


## 新的解决方式
### cookie存在问题
1.网络请求耗费资源
2.安全性

### session
session是服务端存储用户信息，当用户登录后返回sessionId，客户端将sessionID存储在cookie中，客户端在请求时携带sessionID，服务端通过sessionId以及相关映射关系获取用户登录状态。

解决了传递cookie的资源浪费问题，但仍存在安全性的问题。同时服务端需要存储用户状态，增大服务端压力。

### token
token在session的基础上，解决了服务端存储的问题，同时防止 CSRF攻击。
token和sessionId类似不过由用户名和一个服务端提供的数字签名组成。用户成功登陆后，服务端返回token，token可以存在cookie或localstorage等中。token不是随请求自动发送，需要在请求头中添加，即使token放在cookie中，但服务端不是通过cookie中的token进行验证，而是通过请求头中的token进行验证，由此防止了 CSRF攻击。同时token是无状态的，