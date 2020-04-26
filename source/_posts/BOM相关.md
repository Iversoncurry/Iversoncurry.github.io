---
title: BOM相关
tags: JavaScript
---


## window对象

BOM的核心对象时windwo，它表示浏览器的一个实例。**在浏览器中，window对象有双重角色，它既是通过JavaScript访问浏览器窗口的一个接口，又是ECMAScript规定的Global对象。**这意味着在网页中定义的任何一个对象、变量和函数，都是以window作为其Global对象，因此有权访问parseInt()等方法。

### 全局作用域
由于window对象同时扮演者ECMAScript中Global对象的角色，因此所有在全局作用域中声明的变量、函数都会变成window的属性和方法

```js
var age = 29
function sayAge() {
    alert(this.age)
}

alert(window.age)  //29
sayAge()  //29
window.sayAge()  //29
```

抛开全局变量会成为window对象的属性不谈，定义全局变量与在window对象上直接定义属性还是有一点差别：全局变量不能通过delete操作符删除，而直接定义在window对象上的属性可以：
```js
var age = 29
window.color = 'red'
delete window.age

delete window.color
alert(window.age)   //29
alert(window.color)   //undefined
```

定义的全局变量再添加到window时[[Configurable]]被设置为false，因此这样定义的属性不可以通过delete操作符删除。

尝试访问未声明的变量会抛出错误，但通过查询window对象，可以知道某个可能未声明的变量是否存在。
```js
var newValue = oldValue
// 报错，因为oldValue未定义

var newValue = window.oldValue
// 不会报错，值为undefined
```

### 窗口关系及框架
如果页面中包含框架，则每个框架都拥有自己的window对象，并且保存在frames集合中。在frames集合中，可以通过数值索引（从0开始，从左至右，从上到下）或者框架名称来访问相应的window对象。每个window对象都有一个name属性。

```html
<html>
    <head>
        <title>Frameset Example</title>
    </head>
    <frameset row="160, *">
        <frame src="frame.htm" name="topFrame">
        <frameset cols="50%, 50%">
            <frame src="anotherframe.htm" name="leftFrame">
            <frame src="yetanotherframe.htm" name="rightFrame">
        </frameset>
    </frameset>
</html>
```
以上代码创建了一个框架集，可以利用如下代码引用：
```js
window.frames[0]
window.frames.topFrame
top.frames[0]
top.frames.topFrame
frames[0]
frames.topFrame
```
其中top对象始终指向最高层，也就是浏览器窗口。与top相对的另一个window对象时parent。parent始终指向当前框架的直接上层框架。
除非最高层窗口是通过window.open()打开的，否则其window对象的那么属性不会包含任何值。
与框架有关的最后一个对象时self，它始终指向window。
所有这些对象都是window对象的属性，可以通过window.parent、window.top等形式来访问。同时也以为这可以将不同层次的window对象连缀起来，例如window.parent.parent.frames[0].

**注意**
在使用框架的情况下，浏览器中会存在多个Global对象，每个框架中定义的全局变量会自动成为框架中window对象的属性。由于每个window对象都包含原生类型的构造函数，因此每个框架都有一台自己的构造函数，这些构造函数一一对应，但并不相等。例如，top.Object并不等于top.frames[0].Object。这个问题影响到对跨框架传递的对象使用instanceof操作符。

### 窗口位置


### 导航和打开窗口
使用window.open()方法既可以导航到一个特定的URL，也可以打开一个新的浏览器窗口。这个方法可以接收4个参数：要加载的URL，窗口目标，一个特性字符串以及一个表示新页面是否取代浏览器历史记录中当前加载页面的布尔值。**通常只需传递一个参数，最后一个参数只在不打开新窗口的情况下使用。
如果window.open()传递了第二个参数，而且该参数是已有窗口或框架的名称，那么就会在具有该名称的窗口或框架中加载第一个参数指定的URL。

```js
window.open("http://www.wrox.com","topFrame")
// 等同于
<a href="http://www.wrox.com" target="topFrame"><a>
```
调用这行代码，就如同用户单击了href属性为http://www.word.com/, target属性为topFrame的链接。如果有一个名叫topFrame的窗口或者框架，就会在该窗口或框架加载这个URL；否则就会创建一个新的窗口并将其命名为topFrame。此外，第二个参数也可以是下列任何一个特殊的窗口名称。**_self, _parent, _top, _blank.

window.open()方法会返回一个纸箱新窗口的引用。引用的对象与其他window对象大致相似，但可以对其进行更多控制。

## location对象

location提供了与当前窗口中加载的文档有关的信息，还提供了一些导航功能。事实上，location对象时一个很特别的对象，因为它既是window对象的属性，也是document对象的属性；换句话说，window.location和document.location引用的是同一个对象。location对象的用处不只表现在它保存着当前文档的信息，还表现在它将URL解析为独立的片段，让开发人员可以通过不同的属性访问这些片段。以下为location的属性

1.hash  "#contents"   返回URL中的hash（#号后跟零个或多个字符），如果URL中不包含散列，则返回空字符串。
2.host  “www.wrox.com:80"   返回服务器名称含端口号（如果有）
3.hostname  "www.wrox.com"  返回不带端口号的服务器名称
4.href   “http:/www.wrox.com"  返回当前加载页面的完整URL。而location对象的toString()方法也返回这个值
5.pathname   "/wileyCDA"  返回URL中的目录和（或）文件名
6.port   "8080"  返回URL中指定的端口号。如果URL中不包含端口号，则这个属性返回空字符串。
7.protocol  "http:"  返回页面使用的协议。通常是http:或https:
8.search   "?q=javascript"   返回URL的查询字符串。这个字符串以问号开头

### 查询字符串参数
似然通过属性search可以得到从问号到URL末尾的所有内容，但无法逐个访问。由此可以建立一个函数
```js
function getAueryStringArgs() {
    var qs = (location.seratch.length > 0 ? location.search.substring(1): '')
    var args = {}
    var items = qs.length ? qs.split("&") : []
    var item = null
    var value = null
    var i = 0
    var len = item.length
    for(i=0; i < len; i++) {
        item = items[i].split('=')
        name = decodeURIComponent(item[0])
        value = decodeURIComponent(item[1])
        if(name.length) {
            args[name] = value;
        }
    }

    return args
}
```

### 位置操作

使用location对象可通过很多方式来改变浏览器的位置。首先，最常用的就是使用assign()方法并为其传递一个URL，如下所示
```js
location.assign('http://www.worx.com')
```
这样就可以立即打开新URL并在浏览器的历史记录中生成一条记录。
```js
window.location = "http://www.worx.com"
location.href = "http://www.worx.com"
```
以上方式和显式调用assing方法效果一样（因为会调用assing()方法）。
通过修改location的其他属性也能改变当前加载的页面。
```js
// 假设初始URL为http://www.worx.com/wikeyCDA

// 将URL修改为"http://www.worx.com/WileyCDA/#section1"
location.hash = "#section1"

// 将URL修改为"http://www.worx.com/WileyCDA/?q=javascript"
location.search = "?q=javascript"

// 将URL修改为"http://www.yahoo.com/WileyCDA/"
location.hostname = "www.yahoo.com"

// 将URL修改为"http://www.yahoo.com/mydir/"
location.pathname = "mydir"

// 将URL修改为"http://www.worx.com:8080/WileyCDA/"
location.port = "8080"
```
每次修改location的属性（hash除外），页面都会以新URL重新加载。
当通过上述任何一种方式修改URL之后，浏览器的历史记录中就会生成一条新纪录，因此用户通过单击后退俺就都会导航到前一个页面。
要禁用这种行为，可以使用replace()方法。这个方法只接受一个参数，纪要导航到的URL；结果虽然会导致浏览器位置变化，但不会在历史记录中生成新纪录。再调用replace()方法之后，用户不能回到前一个页面。

另一个与位置有关的方法是reload(),作用是重新加载当前显示的页面。如果调用reload()时不传递任何参数，页面就会以最有效的方式重新加载。**就是说如果页面自上次请求依赖没有改变过，页面就会从浏览器缓存中重新加载。如果要强制从服务器重新加载，则需要传递参数true。**
```js
location.reload()       //重新加载（有可能从缓存中加载）
location.reload(true)    //重新加载（从服务器重新加载）
```
位于reload()调用之后的代码可能会也可能不会执行，这要取决于网络延迟或系统资源等因素。为此，最好将reload()放在代码的最后一行。

## history对象
history对象保存着用户上网的历史记录，从窗口被打开的哪一个算起。因为history是window对象的属性，**因此每个浏览器窗口、每个标签页乃至每个框架，都有自己的history对象与特定的window对象关联**。出于安全方面考虑，开发人员无法得知用户浏览过的URL。不过，皆有用户访问过的页面列表，同样可以在不知道实际URL的情况下实现后退和前进。
使用go()方法可以在用户的历史记录中任意跳转，可以向后也可以向前。这个方法接收一个参数，表示向后或向前跳转页面数的一个整数值。负的表示向后跳转（类似于单击浏览器的后退），正数表示向前跳转（类似于单击浏览器的前进按钮）。
```js
// 后退一页
history.go(-1)

history.go(1)

history.go(2)
```
也可以给go()方法传递一个字符串参数，此时浏览器会跳转到历史记录中包含该字符串的第一个位置（可能前进也可能后退，具体要看哪个位置最近。如果历史记录中不包含该字符串，那么什么也不做。
```js
history.go('worx.com')
```
另外还可以使用两个简写方法back()（向后）和forward()（向前）来代替go()。

除了以上几个方法外，history对象还有一个length属性，保存着历史记录的数量。这个数量包括所有历史记录，即所有向后和向前的记录。对于加载到窗口、标签页或框架中的第一个页面而言，history.length等于0。通过如下测试该属性，可以确定用户是否一开始就打开了你的页面
```js
if (history.length == 0) {
    // 是第一个打开的
}