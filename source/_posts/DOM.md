---
title: DOM相关
date: 2020-01-02 20:27:08
tags:
---
DOM文档对象模型，是针对HTML和XML文档的一个API。DOM描绘了一个层次化的节点树，允许开发人员添加、移除和修改页面的某一部分。

## 节点层次
DOM可以将任何HTML或XML文档描绘成一个由多个节点构成的结构。节点分为几种不同类型，每种类型分别表示文档中不同的信息及（或）标记。每个节点都拥有各自的特点数据和方法。另外也与其他节点存在某种关系。节点之间的关系构成了层次，而所有页面编辑则表现为一个一特定节点为根节点的树形结构.

### Node类型
DOM1级定义了一个Node接口，该接口将由DOM中的所有节点类型实现。这个Node接口在JavaScript中是作为Node类型实现的。JavaScript中的所有节点类型都继承自Node类型，因此所有节点类型都共享着相同的基本属性和方法。
每个节点都有一个nodeType属性，用于表明节点的类型。节点类型由在Node类型中定义的12个数值常量表示。

1.nodeName和nodeValue属性
要了解节点的具体信息，可以使用nodeName和nodeValue这两个属性。这两个属性的值完全取决于节点的类型：
```js
if (someNode.nodeType == 1) {  //nodeType = 1表示为一个元素
    value = someNode.nodeName  //nodeName的值是元素的标签名
}
```

2.节点关系
文档中所有的节点之间都存在着联系。在HTML中，可以将<body>元素看成是<html>元素的子元素；相应的，就可以把<html>元素看成是<body>元素的父元素。而<head>元素，则可以看成是<body>元素的同胞元素，因为它们都是同一个父元素<html>的直接子元素。

每个节点都有一个childNodes属性，其中保存着一个NodeList对象。NodeList是一种类数组对象，用于保存一组有序的节点，可以通过为止来访问这些节点。**NodeList对象实际上是基于DOM结构动态执行查询的结果，因此DOM结构的变化能够自动反应在NodeList对象中。我们常说，NodeList是有生命的、有呼吸的对象，而不是在我们第一次访问他们的某个瞬间拍摄下来的一张快照。**

```js
var firstChild = someNode.childNodes[0]
var secondChild = someNode.childNodes.item(1)
var count = someNode.childNodes.length
```
其中length属性表示的是访问NodeList的那一刻，其中包含的节点数量。


3.操作节点
DOM提供了一些操作节点的方法。其中最常用的方法是appendChild()，用于向childNodes列表的末尾添加一个节点。添加节点后，childNodes的新增节点、父节点及以前的最后一个子节点的关系指针都会相应地得到更新。更新完成后，appendChild()返回新增的节点。
```js
var returnedNode = someNode.appendChild(newNode)
alert(returnedNode == newNode) //true
alert(someNode.lastChild == newNode)  //true
```
**如果传入到appendChild中的节点已经是文档的一部分了，那结果就是将该节点从原来的位置转移到新的位置**。即可以将DOM树看成是由一些列指针连接起来的，任何DOM节点不能同时出现在文档中的多个位置。因此如果调用appendChild()时传入了父节点的第一个子节点，那么该节点就会成为父节点的最后一个子节点。
```js
var returnedNode = someNode.appendChild(someNode.firstChild)
alert(returnedNode == someNode.firstNode)  //false
alert(returnedNode == someNode.lastChild)  //true
```
如果需要把节点放在childNodes列表中某个特定的位置上，而不是放在末尾，那么可以使用insertBefore()方法。这个方法接收连个参数：要插入的节点和作为参照的节点。插入节点后，被插入的节点会变成参照节的前一个同胞节点，同时被方法返回。如果参照节点是null，则insertBefore()与appendChild()执行相同的操作
```js
// 插入后成为最后一个子节点
returnedNode = someNode.insertBefore(newNode, null)
alert(newNode == someNode.lastChild)  //true

// 插入后成为第一个子节点
var returnedNode = someNode.insertBefore(newNode, someNode.firstChild)
alert(returnedNode == newNode)  //true
alert(newNode == someNode.firstChild)  //true

// 插入到最后一个子节点前面
returnedNode = someNode.insertBefore(newNode, someNode.lastChild)
alert(newNode == someNode.childNodes[someNode.childNodes.length - 2])
```
replaceChild()方法接受的两个参数是：要插入的节点和要替换的节点。要替换的节点是将由这个方法返回并从文档树中被移除，同时由要插入的节点占据其位置。

```js
// 替换第一个子节点
var returnedNode = someNode.replaceChild(newNode, someNode.firstChild)

// 替换最后一个子节点
returnedNode = someNode.replaceChild(newNode, someNode.lastChild)
```
在使用replaceChild()插入一个节点时，该节点的所有关系指针都会从被它替换的节点复制过来。被替换的节点还在文档中，但没有了自己的位置。
以上三个方法只针对有子节点的节点，没有子节点的节点调用后会报错。

4.其他方法
有两个方法是所有类型的节点都有的。第一个是cloneNode()，用于创建调用这个方法的节点的一个完全相同的副本。cloneNode()方法接受一个布尔参数，表示是否执行深复制。在参数为true的情况下，执行深复制，也就是复制节点及其整个子节点树；在参数为false的情况下，执行浅复制，即只复制节点本身。复制后返回的节点副本属于文档所有，但并没有为它指定父节点。

另一种方法是normalize(),这个方法唯一的作用就是处理文档树中的文本节点。由于解析器的实现或DOM操作等原因，可能会出现文本节点不包含文本，或者接连出现两个文本节点的情况。当在某个节点上调用这个方法时，就会在该节点的后代节点中查找上述两种情况。如果找到了空文本节点，则删除它；如果找到相邻的文本节点，则将它们合并为一个文本节点。

### Document类型
JavaScript通过Document类型表示文档。**在浏览器中，document对象是HTMLDocument(继承自Document类型)的一个实例，表示整个HTML页面**。而且document对象时window对象的一个属性，因此可以将其作为全局对象来访问。

1.文档信息
document对象的一些属性能够表现网页的一些信息。
1）document.title
通过这个属性可以取得当前页面的标题，也可以修改当前页面的标题并反映在浏览器的标题栏中。

2）document.URL
该属性包含着页面完整的URL

3）document.domain
该属性中包含着页面的域名，可以设置，但并不是可以任意设置。如果URL中包含一个子域名，例如p2p.wrox.com，那么就只能将domain设置为wrox.com。不能讲这个属性设置为URL中不包含的域。两个页面同时设置为相同的document.domain则可进行通信。
但是初始是松散的如wrox.com，则不能再将其设置为紧绷的p2p.wrox.com。

4）document.referrer
该属性中保存着链接到当前页面的那个页面的URL。在没有来源页面的情况先，referrer属性中可能会包含空字符串。

3.查找元素
有几种查找元素的方法：
1.getElementByID()，接收一个参数，要取得的元素的ID。如果找到则返回，否则返回null

2.getElementByTagName()。这个方法接受一个参数，即要取得元素的标签名，而返回的是包含零过多个元素的NodeList。在HTML文档中，这个方法会返回一个HTMLCollection对象，作为一个动态几何，该对象与NodeList非常类似。

3.getElementByName()
只有HTMLDocument类型才有的方法。这个方法会返回带有给定的name特性的所有元素。

4.文档写入
有一个document对象的功能已经存在很多年了，那就是将输出流写入到网页的能力。这个能力体现在下列4个方法中：
1.write()和writeln()
write()和writeln()方法都接受一个字符串参数，即要写入到输出流中的文本。write()会远洋写入，而writeln()则会在字符串的末尾添加一个换行符（\n)。页面被加载的过程中，可以使用这两个方法向页面中动态地加入内容
```html
<html>
<head>
<title>document.write() Example</title>
</head>
<body>
<p>the current date and time is:
<script type="text/javascript>
document.write("<strong>" + (new Data()).toString() + "</strong>")
</script>
</p>
</body>
</html>
```

2.open(),close()
open()和close()分别用于打开和关闭网页的输出流。如果是在页面加载期间使用write()或writeln()方法，则不需要用到这两个方法。

### 使用NodeList
理解NodeList、NameNodeMap和HTMLCollection，是从整体上透彻理解DOM的关键所在。这三个集合都是动态地；换句话说，当文档结构发生变化时，它们都会得到更新。因此，它们始终都会保存着最新、最准确的信息。从本质上讲，所有NodeList对象都是在访问DOM文档时实时运行的查询。
如下代码将导致无限循环
```js
var divs = document.getElementsByTagName('div')
var i
var div
for(let i = 0; i < divs.length; i++) {
    div = document.createElement('div')
    document.body.appendChild(div)
}
```
第一行代码会取得文档中所有<div>元素的HTMLCollection。由于这个集合是动态地，因此只要有新的<div>元素被添加到页面中，这个元素也会被添加到该集合中。浏览器不会将创建的所有集合都保存在一个列表中，而是在下一次访问集合时再更新集合。由此将导致无限循环。

## DOM扩展
### 选择符API
众多JavaScript库中最常用的一项功能，就是根据CSS选择符与某个模式匹配的DOM元素。Selectors API Level 1的核心是两个方法：querySelector()和querySelectorAll()。

1.querySelector()方法
querySelector()方法接受一个CSS选择符，返回与该模式匹配的第一个元素，如果没有找到匹配的元素，返回null。
```js
var body = document.querySelector("body")
var myDiv = document.querySelector('#myDiV')
var selected = document.querySelector('.selected')
var img = document.body.querySelector('img.button')
```

2.querySelectorAll()方法
querySelectorAll()方法接收的参数与querySelector()方法一样，都是一个CSS选择符，但返回的是所有匹配的元素而不仅仅是一个元素。这个方法返回的的是一个NodeList的实例。
具体来说，返回的值实际上是带有所有属性和方法的NodeList，而其底层实现类似于一组元素的快照，而非不断对文档进行搜索的动态查询。这样实现可以避免使用NodeList对象通常会引起的大多数性能问题。
