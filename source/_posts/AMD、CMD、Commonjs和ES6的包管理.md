---
title: AMD、CMD、CommonJs和ES6对比
date: 2020-03-26 20:27:08
tags: JavaScript
---

以上都是用于在模块化定义中使用的，AMD、CMD、CommonJs是ES中提供的模块化编程的方案，import/export是ES6中新增的。

## CommonJS(同步)
Nodejs模块系统就采用CommonJS模式。CommonJS标准规定，一个单独的文件就是一个模块，模块内将需要对外暴露的变量放到export对象里，可以是任意对象，函数，数组等，潍坊到exports对象里的都是私有的。用require方法加载模块，即读取模块文件获得exports对象。
CommonJS编程示例：

```js
// 定义hi.js：
var str = 'Hi';
function sayHi(name) {  
    console.log(str + ', ' + name + '!');
}
module.exports = sayHi;

// 加载
var Hi = require('./hi');
Hi('Jack');     // Hi, Jack!
```
### Nodejs中module.exports和exports区别
module和exports是Node.js给每个js文件内置的两个对象。实际上，这两个对象指向同一块内存。require引入的对象本质上是module.exports。当 module.exports和exports指向的不是同一块内存时，exports的内容就会失效。
例如
```js
module.exports = {name: '萤火虫叔叔'}；
exports = {name: '萤火虫老阿姨'}  //更改了exports指向
```

## AMD-异步模块定义

AMD（Asynchronous Module Definition)，是RequireJS推广过程中对模块定义的规范化准则，它是一个概念，RequireJS是对这个概念的实现，就好比JavaScript语言是对ECMAScript规范的实现。AMD是一个组织，RequireJS是在这个组织下定义的一套脚本语言。

AMD采用异步方式加载模块，模块的加载不影响它后面的语句运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完成之后，这个回调函数才会执行。
AMD使用define定义模块，AMD可以采用require()语句加载模块，但是不同于CommonJs，它要求两个参数
```js
define([module],fn)
require([module], callback)
```
define第一个参数[module]是该模块的依赖，第二个参数fn返回一个可以引用的模块对象。require第一个参数[module]，是一个数组，里面的成员就是要加载的模块，第二个参数callback则是加载成功之后的回调函数。如果将前面的代码改写成AMD形式如下：
```js
// 定义test.js模块
define(['math'], function(math) {
    var addHello = function(x, y) {
        
        return Array(math.add(x,y)).fill('hello')
    }
    return {
        addHello: addHello
    }
})

// 加载
require(['test'], function(t) {
    alert(test.addHello)
})
```
math.add()与math模块加载不是同步的。

## CMD
CMD是SeaJS在推广过程中对模块定义的规范化产出，是一个同步模块定义，是SeaJS的一个标准，SeaJS是CMD概念的一个实现，SeaJS是淘宝团队提供的一个模块开发的js框架。

通过define()定义，没有依赖前置，通过require加载jQuery插件，CMD是依赖就近，在什么地方使用到插件就在什么地方require该插件，即用即返。
```js
define(function(require, exports, module) {

  // 正确写法
  module.exports = {
    foo: 'bar',
    doSomething: function() {}
  };

});
```

SeaJS只会在真正需要使用(依赖)模块时才执行该模块
SeaJS是异步加载模块的没错, 但执行模块的顺序也是严格按照模块在代码中出现(require)的顺序,而RequireJS会先尽早地执行(依赖)模块, 相当于所有的require都被提前了, 而且模块执行的顺序也不一定100%就是先mod1再mod2