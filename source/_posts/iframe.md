---
title: iframe
tags: JavaScript
---
每个嵌入的浏览器上下文（embedded browsing context）都有自己的会话历史记录和dom树。包含嵌入内容的浏览器上下文成为符浏览上下文。顶级浏览上下文（即没有父级）通常是由window对象表示的浏览器窗口。

## 属性
该元素包含全局属性。
这里只介绍比较常用的几个
name： 用于定位嵌入的浏览器上下文的名称。该名称可以用作a标签与form标签的target属性值，也可以用作input标签和button标签的formtarget属性值，还可以用作window.open()方法的windowName参数值。

src：被嵌套的页面的URL地址。使用about:blank值可以嵌入一个遵从同源策略的空白页。

## 脚本
内联的框架，就像frame元素一样，会被包含在window.frames伪数组中。
有了DOMHTMLIFrameElement对象，脚本可以通过contentWindow访问内联框架的window对象。contentDocument属性则引用了iframe内部的document元素。
在框架内部，脚本可以通过window.parent引用父窗口对象。
脚本访问框架内容必须遵守同源策略，并且无法访问同源的window对象的几乎所有属性。同源策略同样适用于子窗体访问父窗体的window对象。跨域通信可以通过window.postMessage实现。

window.postMessage()方法可以安全地事项跨源通信。通常，对于两个不同页面的脚本，只有当执行它们的页面位于相同的协议通常为https，端口号（443位https的默认值），以及主机（两个页面的模数Document.domain设置相同的值）时，两个脚本才能相互通信。
window.postMessage()方法提供了一种受控机制来规避此限制，只要正确的使用，这种方法就很安全。
从广义上讲，一个窗口可以获得对另一个窗口的引用（比如targetWindow= window.opener),然后在窗口上调用targetWindow.postMessage()方法分发一个MessageEvent消息。接收消息的窗口可以根据需要自由处理此事件。传递给window.postMessage()的参数（比如message）将通过消息事件对象暴露给接收消息的窗口。

### postMessage语法
```js
otherWindow.postMessage(message, targetOrigin, [transfer])
```
otherWindow:其他窗口的一个引用，比如iframe的contentWindow属性、执行window.open返回的窗口对象、或者是明明过或数值索引的window.frames.

message: 将要发送到其他window的数据。它将会被结构化克隆算法序列化。这意味着可以不受什么限制的将数据对象安全地传送给目标窗口而无需自己序列化。

targetOrigin：通过窗口的origin属性来指定哪些窗口能接收到消息事件，其值可以是字符串"*"*（表示无限制）或者一个URI。在发送消息的时候，如果目标窗口的协议、主机地址或端口这三者的任意一项不匹配targetOrigin提供的值，那么消息就不会被发送；只有三者完全匹配，消息才会被发送。这个机制用来控制消息可以发送到哪些窗口；例如，当用postMessage传送密码时，这个参数就显得尤为重要，必须保证它的值与这条包含密码的信息的预期接受者的origin属性完全一致，来防止密码被恶意的第三方截获。如果你明确的知道消息应该发送到哪个窗口，那么请始终提供一个有确切值的targetOrigin，而不是"*"。不提供确切的目标将导致数据泄露到任何对数据感兴趣的恶意站点。

**对otherWindw和targetOrigin的理解**：otherWindow设定了要传递信息的窗口，并不会限制信息只向这个窗口传递信息，**是目标窗口**。targetOrigin设定了要传递窗口所在的URI包括协议，主机和端口，**限定了目标窗口的URI**。

transfer 可选
是一串和message 同时传递的 Transferable 对象. 这些对象的所有权将被转移给消息的接收方，而发送一方将不再保有所有权。

利用postMessage可以实现子域和父域相互传递消息以及不同域之间的通信。
message事件监听
```js
window.addEventListener("message", receiveMessage, false);

function receiveMessage(event)
{
  // For Chrome, the origin property is in the event.originalEvent
  // object. 
  // 这里不准确，chrome没有这个属性
  // var origin = event.origin || event.originalEvent.origin; 
  var origin = event.origin
  if (origin !== "http://example.org:8080")
    return;

  // ...
}
```
 message 的属性有:

data
从其他 window 中传递过来的对象。
origin
调用 postMessage  时消息发送方窗口的 origin . 这个字符串由 协议、“://“、域名、“ : 端口号”拼接而成。例如 “https://example.org (隐含端口 443)”、“http://example.net (隐含端口 80)”、“http://example.com:8080”。请注意，这个origin不能保证是该窗口的当前或未来origin，因为postMessage被调用后可能被导航到不同的位置。
source
对发送消息的窗口对象的引用; 您可以使用此来在具有不同origin的两个窗口之间建立双向通信

不同域之间传递
```js
/*
 * A窗口的域名是<http://example.com:8080>，以下是A窗口的script标签下的代码：
 */

var popup = window.open(...popup details...);

// 如果弹出框没有被阻止且加载完成

// 这行语句没有发送信息出去，即使假设当前页面没有改变location（因为targetOrigin设置不对）,协议不同
popup.postMessage("The user is 'bob' and the password is 'secret'",
                  "https://secure.example.net");

// 假设当前页面没有改变location，这条语句会成功添加message到发送队列中去（targetOrigin设置对了）
popup.postMessage("hello there!", "http://example.org");

function receiveMessage(event)
{
  // 我们能相信信息的发送者吗?  (也许这个发送者和我们最初打开的不是同一个页面).
  if (event.origin !== "http://example.org")
    return;

  // event.source 是我们通过window.open打开的弹出页面 popup
  // event.data 是 popup发送给当前页面的消息 "hi there yourself!  the secret response is: rheeeeet!"
}
window.addEventListener("message", receiveMessage, false);
/*
 * 弹出页 popup 域名是<http://example.org>，以下是script标签中的代码:
 */

//当A页面postMessage被调用后，这个function被addEventListenner调用
function receiveMessage(event)
{
  // 我们能信任信息来源吗？
  if (event.origin !== "http://example.com:8080")
    return;

  // event.source 就当前弹出页的来源页面
  // event.data 是 "hello there!"

  // 假设你已经验证了所受到信息的origin (任何时候你都应该这样做), 一个很方便的方式就是把event.source
  // 作为回信的对象，并且把event.origin作为targetOrigin
  event.source.postMessage("hi there yourself!  the secret response " +
                           "is: rheeeeet!",
                           event.origin);
}

window.addEventListener("message", receiveMessage, false);
```
```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>跨域POST消息发送</title>
        <script type="text/JavaScript">   
            // sendPost 通过postMessage实现跨域通信将表单信息发送到 moweide.gitcafe.io上,
            // 并取得返回的数据   
            function sendPost() {       
                // 获取id为otherPage的iframe窗口对象       
                var iframeWin = document.getElementById("otherPage").contentWindow;       
                // 向该窗口发送消息       
                iframeWin.postMessage(document.getElementById("message").value, 'http://moweide.gitcafe.io');   
            }   
            // 监听跨域请求的返回   
            window.addEventListener("message", function(event) {       
                console.log(event, event.data);   
            }, false);
        </script>
    </head>
    <body>
        <textarea id="message"></textarea>
        <input type="button" value="发送" onclick="sendPost()">
        <iframe
            src="http://moweide.gitcafe.io/other-domain.html" id="otherPage" style="display:none"></iframe>
    </body>
</html>
<!-- 子窗体接收信息并处理 -->
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>POST Handler</title>
        <script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
        <script type="text/JavaScript">
            window.addEventListener("message", function( event ) {
                // 监听父窗口发送过来的数据向服务器发送post请求
                var data = event.data;
                $.ajax({
                    // 注意这里的url只是一个示例.实际练习的时候你需要自己想办法提供一个后台接口
                    type: 'POST',
                    url: 'http://moweide.gitcafe.io/getData',
                    data: "info=" + data,
                    dataType: "json"
                }).done(function(res){       
                    //将请求成功返回的数据通过postMessage发送给父窗口       
                    window.parent.postMessage(res, "*");   
                }).fail(function(res){       
                    //将请求失败返回的数据通过postMessage发送给父窗口       
                    window.parent.postMessage(res, "*");   
                });
            }, false);
        </script>
    </head>
    <body></body>
</html>
```