---
title: Ajax与Comet
date: 2020-04-02 20:27:08
tags: JavaScript
---


Ajax是一种能够向服务器请求额外的数据而无需卸载页面。为Asynchornous.JavaScript + XML的简写。
Ajax的技术核心是XMLHttpRequest对象（简称XHR）。在XHR出现之前，Ajax式的通信必须借助一些hack手段来实现，大多数是使用隐藏的框架或内嵌框架。XHR为向服务器发送请求和解析服务器响应提供了流畅的接口。能够以异步方式从服务器取得更多信息，意味着用户单击后，可以不必刷新页面也能取得新数据。也就是说，可以使用XHR对象取得新数据，然后在通过DOM将新数据插入到页面中。另外，虽然名字中包含XML的成分，但Ajax通信与数据格式无关；这种技术就是无需刷新页面即可从服务崎岖的数据，但不一定是XML数据。


## XMLHttpRequest对象
### XHR的用法
在使用XHR对象时，要调用的第一个方法是open(),它接受三个参数：要发送的请求的类型（’get‘，‘post’等），请求的URL和是否异步发送请求的布尔值。
```js
var xhr = new XMLHTTPRequest()
xhr.open('get', 'example.php', false)
```
这行代码会启动一个针对example.php的get请求。有关这行代码，需要说明两点： 一是URL相对于执行大妈的当前页面（当然也可以使用绝对路径）；二是调用open()方法并不会真正发送请求，而只是起送一个请求以备发送。
要发送特定的请求，必须像如下代码：
```js
xhr.open('get', 'example.txt', false)
xhr.send(null)
```
这里send()方法接收一个参数，即要作为请求主体发送的数据。如果不需要通过请求主体发送的数据，则必须传入null，因为这个参数对于有些浏览器来说是必须的。调用send()之后，请求就会被分派到服务器。由于这次请求时同步的，javaScript代码会等到服务器响应之后再继续执行。在收到响应后，响应的数据会自动填充XHR对象的属性，相关的属性简介如下：

responseText：作为响应主体被返回的文本
responseXML：如果响应的内容是’text/xml‘或“application/xml”，这个属性中将保存包含着响应数据的XML DOM文档
status： 形影的HTTP状态
statusText： HTTP状态的说明
在接收到响应后，第一步是检查status属性，以确定响应已经成功返回。一般来说，可以将HTTP状态代码为200作为成功的标志。此时，responseText属性的内容已经就绪，而且在内容类型正确的情况下，responseXML也应该能够访问了。此外，状态代码为304表示请求的资源并没有被修改，可以直接使用浏览器中缓存的版本；当人也意味着响应时有效的。

像前面这样发送同步请求相对较少，大多数情况下，需要发送异步请求。此时，可以检测XHR对象的readyState属性，该属性表示请求/响应过程的当前活动阶段。这个属性可取的值如下。
0：未初始化。尚未调用open方法
1：启动。已经调用open()方法，但尚未调用send()方法
2：发送。已经调用send()方法，但尚未接收到响应
3：接收。已经接收到部分相应数据。
4：完成。已经接收到全部响应数据，而且已经可以在客户端使用。
只要readyState属性的值由一个值编程另一个值，都会触发一次readystatechange事件。可以利用这个事件来检测每次状态变化后readyState的值。通常，我们只对readyState值为4的阶段感兴趣。此时所有数据都已经就绪。不过，必须调用open()之前指定onreadystaechange事件处理程序才能确保跨浏览器兼容性
```js
var xhr = createXHR()
xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
            alert(xhr.responseText)
        } else {
            alert('response was unsuccessful: ' + xhr.status)
        }
    }
}

xhr.open('get', 'example.txt', true)
xhr.send(null)
```
以上代码利用DOM0级方法为XHR对象添加了事件处理程序，原因是并非所有的浏览器都支持DOM2级方法。与其他事件处理程序不同，这里没有像onreadystatechange事件处理程序中传递event对象，必须通过XHR对象本身来确定下一步该怎么做。
另外，在接受到响应之前还可以调用abort()方法来取消异步请求，如下：
```js
xhr.abort()
```
调用这个方法后，XHR对象会停止触发事件，而且也不再允许访问任何与响应有关的对象属性。在终止请求之后，还应该对XHR对象进行解引用操作。由于内存原因，不建议重用XHR对象。

### HTTP头部信息
每个HTTP请求和响应都会带有响应的头部信息，XHR对象也提供了操作这两种头图（即请求头和响应头）信息的方法
默认情况下，在发送XHR请求的同时，还会发送下列头部信息
Accept：浏览器能够处理的内容类型
Accept-Charset：浏览器能够显示地字符集
Accept-Encoding：浏览器嫩狗处理的压缩编码。
Accept-language：浏览器当前设置的语言。
Connection： 浏览器与服务器之间链接的类型。
Cookie：当前页面设置的任何Coolie
Host：发出请求的页面所在的域。
Referer：发出请求的页面的URI。
User-Agent：浏览器的用户代理字符串。
虽然不同浏览器实际发送的头部信息会有所不同，但以上列出的基本上是所有浏览器都会发送的。使用seRequestHeader()方法可以设置自定义的请求头部信息。这个方法接受两个参数：头部字段的名称和头部字段的值。要成功发送请求头部信息，必须再调用open方法之后且调用send方法之前调用setRequestHeader
```js
var xhr = createXHR();
xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
            alert(xhr.responseText)
        } else {
            alert('response was unsuccessful: ' + xhr.status)
        }
    }
}

xhr.open('get', 'example.php',true)
xhr.setRequestHeader('MyHeader', 'MyValue')
xhr.send(null)
```
部分浏览器不支持重写默认的头部信息。
调用XHR对象的getResponseHeader()方法并传入头部字段名称，可以取得相应的响应头部信息。而调用getAllReponseHeader()方法则可以取得一个包含所有头部信息的长字符串。

### GET请求
get常用语向服务器查询某些信息。必要时，可以将查询字符串参数追加到URL末尾，以便将信息发送给服务器。对XHR而言，**位于传入open()方法的URL末尾的查询字符串必须经过正确的编码才行。**
使用GET请求经常会发生一个错误，就是查询字符串的格式有问题。查询字符串中每个参数的名称和值都必须使用encodeURIComponent()进行编码，然后才能放到URL的末尾；而且所有名值对都必须由（&）号分隔，如下例子：
```js
xhr.open('get', 'example.php?name1=value1&name2=value2',true)
```
下面这个函数可以辅助向现有URL的末尾添加查询字符串参数：
```js
function addURLParam(url, name, value) {
    url += (url.indexof('?') == -1 ? '?': '&')
    url += encodeURIComponent(name) + '=' + encodeURIComponent(value)
}
```

### POST请求
POST通常用于向服务器发送应该被保存的数据。POST请求应该把数据作为请求的主体提交。POST请求的主体可以包含非常多的数据，而且格式不限。在open()方法第一个参数的位置传入’post‘，就可以初始化一个POST请求
发送POST请求的第二步就是想send()方法中传入某些数据。由于XHR最初的设计主要是为了处理XML，因此可以在此传入XML DOM文档，传入的文档经序列话之后将作为请求主体被提交到服务器。**也可以在此传入任何想发送到服务器的字符串。**
默认情况下，服务器对POST请求和提交Web表单的请求并不会一视同仁。因此服务器端必须有程序来读取发送过来的原始数据，并从中解析出有用的部分。不过，我们可以使用XHR来模仿表单提交：
首先将Content-Type头部信息设置为application/x-www-form-urlencoded,就是表单提交时的内容类型，其次是以适当的格式创建一个字符串。

```js
// serialize()函数为表单序列化函数

xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
            alert(xhr.responseText)
        } else {
            alert('response was unsuccessful: ' + xhr.status)
        }
    }
}

xhr.open('post', 'postexample.php',true)
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
var form = document.getElementById('user-info')
xhr.send(serialize(form))
```
这个函数可以将ID为’user-info’的表单中的数据序列化之后发送给服务器。而下面的示例PHP文件postexample.php就可以通过$_POST取得提交的数据了。
```PHP
<?php
header('Content-Type: text/plain')>
echo <<<EOF
Name: {$_POST['user-name']}
Email: {$_POST['user-email']}
EOF;
?>
```
如果不设置Content-Type头部信息，那么发送给服务器的数据就不会出现在$_POST超级全局变量中。这时候，要访问同样的数据，就必须借助$HTTP_RAW_POST_DATA.

## XMLHttpRequest 2级

XMLHttpRequest 2级并非所有浏览器都完整实现了。

### FormData
XMLHttpRequest 2级定义了FormData类型。FormData为序列化表单以及创建表单格式相同的数据（用于通过XHR传输）提供了便利。下面的代码创建了一个FormData对象，并向其中添加了一些数据。
```js
var data = new FormData()
data.append('name', 'Nicholas')
```
这个append()方法接收两个参数：键和值，分别对应表单字段的名字和字段中包含的值。可以像这样添加任意多个键值对。而通过向FormData构造函数中传入表单元素，也可以用表单元素的数据预先向其中键入键值对。
```js
var data = new FormData(document.form[0])
```
创建了FormData实例后，可以将它直接传给XHR的send方法
```js
var xhr = createXHR()
xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
            alert(xhr.responseText)
        } else {
            alert('response was unsuccessful: ' + xhr.status)
        }
    }
}
xhr.open('post', 'postexample.php', true)
var form = document.getElementById('user-info');
xhr.send(new FormData(form))
```
使用FormData的方便之处在于**不必明确地在XHR对象上设置请求头部。**XHR对象能够识别传入的数据类型是FormData的实例，并配置适当的头部信息。

### 超时设定
IE8位XHR对象添加了一个timeout属性，表示请求在等待响应多少毫秒之后就终止。在给timeout设置衣蛾数值后，如果在规定的事件内浏览器还没有接收到响应，那么就会触发timeout事件，进而会调用ontimeout事件处理程序。

```js
var xhr = createXHR();
xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        try {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
            alert(xhr.responseText)
            } else {
                alert('response was unsuccessful: ' + xhr.status)
            }
        } catch (ex) {
            // 假设由ontimeout事件处理程序处理
        }
    }
}

xhr.open('get', 'timeout.php', true)
xhr.timeout = 1000;
xhr.ontomeout = function() {
    alert('Request did not return in a second')
}
xhr.send(null)
```
请求终止时，会调用ontimeout事件处理程序。但此时readyState可能已经变为4了，这意味着会调用onreadystateChange事件处理程序。因此需要封装在try-catch语句中。

### overrideMineType()方法

该方法用于重写XHR响应的MIME类型。这个方法后来也被纳入XMLHttpRequest 2级规范。因为返回响应的MIME类型决定了XHR对象如何处理它，所以提供一种方法能够重写服务器返回的MIME类型是很有用的。
比如服务器返回的MIME类型是text/plain,但数据中实际包含的是XML。根据MIME类型，即使数据是XML，responseXML属性中仍然是null。通过overrideMimeType()方法，可以保证把响应当做XML而非纯文本来处理。
```js
var xhr = createXHR()
xhr.open('get', 'text.php', true)
xhr.overrideMimeType('text/xml')
xhr.send(null)
```
这个例子强迫XHR对象将响应当做XML而非纯文本来处理。调用overrideMimeType()必须在send()方法之前，才能保证重写响应的MIME类型。

## 进度事件
Progress Events规范是W3C的一个工作草案，定义了与客户端服务器通信的有关事件。有以下6个进度事件。
loasstart: 在接收响应数据的第一个字节时触发。
progress： 在接收响应期间持续不断地触发。
error: 在青丘发生错误时触发。
load： 在接收到完整的响应数据时触发。
loadend：在通信完成或者触发error、abort或load事件后触发。
每个请求都从触发loadstart事件开始，接下来是一或多个progress事件，然后触发error、abort或load事件中的一个，最后触发loadend事件结束。

### load事件
引入load事件，用以替代readystatechange事件。响应接收完毕后将触发load事件，因此也就没有必要去检查readyState属性了。而onload事件处理程序会接收到一个event对象，其target属性就只想XHR对象实例。因此可以访问到XHR对象的所有方法和属性。然而，并非所有浏览器都为这个事件实现了适当的事件对象。因此还需要引用XHR对象变量。
```js
var xhr = createXHR()
xhr.onload = function() {
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
        alert(xhr.responseText)
    } else {
        alert('resquest was unsuccessful: ' + xhr.status)
    }
}
xhr.open('get' 'altevents.php', true)
xhr.send(null)
```
只要浏览器接收到服务器的响应，不管其状态如何，都会触发load事件。这意味着必须检查status属性。

### progress事件

这个事件会在浏览器接收新数据期间周期性的触发。而onporgress事件处理程序会接收到一个event对象，qitarget属性是XHR对象，但包含三个额外的属性：lengthComputable、position和totalSize。其中，lengthComputable时表示进度信息是否可用的布尔值，position表示已经接收的字节数，totalSize表示根据Content-Length响应头部确定的预期字节数。有了这些信息，就可以为用户创建一个进度指示器了。

```js
var xhr = createXHR()
xhr.onload = function() {
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
        alert(xhr.responseText)
    } else {
        alert('resquest was unsuccessful: ' + xhr.status)
    }
}

xhr.onprogress = function(event) {
    var divStatus = document.getElementById('status')
    if (event.lengthComputable) {
        divStatus.innerHTML = 'Received' + event.position + 'of' + event.totalSize + 'bytes'
    }
}

xhr.open('get','altevents.php', true)
xhr.send(null)
```
为确保正常执行，必须在调用open()方法之前添加onprogress事件处理程序。
