---
title: 作用域、闭包以及this
date: 2019-11-30 14:50:06
tags: JavaScript
---
## 执行环境及作用域
执行环境（execution context, 有时也成为环境）是JavaScript中最为重要的一个概念。执行环境定义了变量或函数有权访问的其他数据，决定了它们各自的行为。**每个执行环境都有一个与之关联的变量对象（variable object），环境中定义的所有变量和函数都保存在这个对象中。**
全局执行环境是最外层的一个执行环境。根据ECMAScript实现的所在的宿主环境不同，表示执行环境的对象也不一样。在web浏览器中，全局执行环境被认为是window对象，因此所有全局变量和函数都是作为window对象的属性和方法创建的。某个执行环境中的所有代码执行完毕后，该环境被销毁，保存在其中的所有变量和函数定义也随之销毁（全局执行环境知道应用程序退出————例如关闭网页或浏览器————时才会被销毁）。
每个函数都有自己的而执行环境，当执行流进入一个函数时，函数的环境就会被推入一个环境栈中。而在函数执行之后，栈将其环境弹出，把控制权返回给之前的执行环境。ECMAScript程序中的执行流正事由这个方便的机制控制着。

当代码在一个环境中执行时，会创建变量对象的一个作用域链（scope chain）。作用域链的用途，时保证对执行换进有权访问的所有变量和函数的有序访问。作用域链的前端，始终都是当前执行的代码所在环境的变量对象。**如果这个环境是函数，则将其活动对象（activation object）作为变量对象。**活动对象在最开始时只包含一个变量，即arguments对象（这个对象在全局环境中是不存在的）。作用域链中的下一个变量来自包含（外部）环境，而再下一个变量对象则来自下一个包含环境。这样一直延续到全局执行环境；全局执行环境的变量对象始终都是作用域链中的**最后一个对象**。
标识符解析是沿着作用域链一级一级地搜索标识符地过程。搜索过程始终从作用域链地前端开始，然后逐级地向后回溯，知道找到表示符为止（如果找不到标识符，通常会导致错误发生）。
**延长作用域链**
虽然执行环境地类型总共只有两种————全局和局部（函数），但还是有其他办法来演唱作用域链。这么说是因为有些语句可以在作用域链地前端临时增加一个变量对象，该变量对象会在代码执行后被移除。当执行流进入下列任何一个语句时，作用域链就会得到加长：
try-catch语句地catch块；
with语句
这两个语句都会在作用域链地前端添加一个变量对象。对with语句来输欧，会将指定的对象添加到作用域链中。对于catch语句来说，他会创建一个新的变量对象，其中包含的时被抛出的错误对象的声明
```JS
function buildUrl() {
    var qs = '?debug=true'
    with(localtion) {
        var url = href + qs      //href相当于location.href
    }
    return url
}
```
**没有块级作用域**
JavaScript没有块级作用域。在其他类C语言中，由花括号封闭的代码块都有自己的作用域（如果用ECMAScript的话来讲，就是他们自己的执行环境），**因而支持根据条件来定义变量**
```JS
if (true) {
    var color = 'blue'
}
console.log(color)    //'blue'
for (var i=0; i<10; i++ ) {
    doSomething(i)
}
console.log(i)        //10
```
**声明变量**
使用var声明的变量会自动被添加到最接近的环境中。在函数内部，最接近的环境就是函数的局部环境；在with语句中，最接近的环境是函数环境。**如果初始化变量时没有使用var声明，该变量会自动添加到全局环境**
```JS
function add(num1, num2) {
    var sum = num1 + num2
    return sum
}
var result = add(10, 20)
console.log(sum)               //error

function add(num1, num2) {
    sum = num1 + num2
}
return sum
var result = add(10, 20)
console.log(sum)             //30
```
**查询标识符**
挡在某个环境中为了读取或者写入而引用一个标识符时，必须通过搜索来确定该标识符实际代表什么。搜索从作用域链的前端开始，向上逐级查询与给定名字匹配的标识符。如果在局部环境中找到了该标识符，搜索过程停止，变量就绪。如果在局部环境中没有找到改变两名，则继续沿作用域链向上搜索。搜索过程将一直追溯到全局环境的变量对象。如果在全局环境中也没有找到这个标识符，则意味着该变量尚未声明。


## 作用域
尽管通常将JavaScript归类为“动态”或“解释执行”语言，但事实上他是一门编译语言。但与传统的编译语言不通，它不是提前编译的，编译的结果也不能在分布式系统中进行移植。
在传统编译语言的流程中，程序的一段源代码在执行之前会经历三个步骤，统称为编译。
**分词/词法分析（Tokenizing/Lexing)**
这个过程会将由字符组成的字符串分解成有意义的代码块，这些代码块被称为词法单元（token）。例如，考虑程序var a = 2;。这段程序通常会被分解成下面这些词法单元：var、a、=、2、;。空格是否会被当作词法单元，取决于空额在这门语言中是否具有意义。
**分词和词法分析之间的区别是非常微妙、晦涩的，主要差异在于词法单元的识别是通过有状态还是无状态的方式进行的。简单来说，如果词法单元生成器在判断a是一个独立的此法单元还是其他词法单元的一部分时，调用的是有状态的解析规则，那么这个过程就被成为词法分析。**
**解析/语法分析**
这个过程是将词法单元流（数组）转换成一个铀元素逐级嵌套所组成的代表了程序语法结构的树。这个树被称为“抽象语法树”（Abstract Syntax Tree, AST)。
var a = 2; 的抽象语法树中可能会有一个叫作VariableDeclaration的顶级节点，接下来是一个叫做Identifier（它的值是a）的子节点，以及一个叫做AssignmentExpression的子节点。AssignmentExpression节点有一个叫做Numericliteral（它的值是2）的子节点。
**代码生成**
将AST转换为可执行代码的过程被车跟为代码生成。这个过程与语言、目标平台等息息相关。简单来说就是有某种方法可以将var a = 2;的AST转化为一组机器指令，用来创建一个叫做a的变量（包括分配内存等），并将一个值存储在a中。

比起那些编译过程中只有三个步骤的语言的编译器，JavaScript引擎要复杂的多。例如在语法分析和代码生成阶段有特定的步骤来对运行性能进行优化，包括对冗余元素进行优化等。
首先，JavaScript引擎不会有大量的时间来进行优化，因为与其它语言不同，JavaScript的编译过程不是发生在构建之前的。对于JavaScript来说，大部分情况下编译发生在代码执行前的几微秒的时间内。在我们要讨论的作用域背后，JavaScript引擎用了各种办法（比如JIT，可以延迟编译甚至试试重编译）来保证性能最佳。
简单地说，任何JavaScript代码片段在执行前都要进行编译。因此JavaScript编译器首先会对var a = 2;这段程序进行编译，然后做好执行它的准备。
## 理解作用域
为理解JavaScript的工作原理，需要以下几个概念：
**引擎**
从头到尾负责整个JavaScript程序的编译以及执行过程
**编译器**
负责语法分析及代码生成
**作用域**
负责收集并维护所有声明的标识符（变量）组成一些列查询，并实施一套非常严格的规则，确定当前执行的代码对这些标识符的访问权限。
实例分析，针对程序 var a = 2;
对于引擎，上述程序代表两个不同的声明，一个由编译器在编译时处理，另一个由引擎在运行时处理。编译器将这段程序分解成词法单元，然后将词法单元解析成一个树结构。编译器会进行如下处理：
1.遇到var a，编译器会询问作用域是否已经有一个改名的变量存在于同一个作用域的集合中。如果是，编译器会忽略该声明，继续进行编译；否则它会要求作用域在当前作用域的集合中声明一个新的变量，并命名为a；
2.接下来编译器会为引擎生成运行时所需的代码，这些代码被用来处理a = 2这个赋值操作。引擎运行时会首先询问作用域，在当前的作用域集合中是否存在一个叫做a的变量。如果时，引擎就会使用这个变量；如果否，引擎就会继续查找该变量。
如果引擎最终找到了a变量，就会将2赋值给它。否则引擎就会抛出一个异常。
总结：变量的赋值操作会执行两个操作，首先编译器会在当前作用域中声明一个变量（如果之前没有声明过），然后在运行时引擎会在作用域中查找该变量，如果能够找到就会对其赋值。
**编译器术语**
编译器在编译过程的第二步中生成了代码，引擎执行时，会通过查找变量a来判断它是否已经声明过。例子中，引擎会为变量进行LHS查询。
当变量出现在赋值操作的左侧时进行LHS查询，出现在右侧时进行RHS查询。RHS查询与简单地查找某个变量地值别无二致，而LHS查询则时视图找到变量的容器本身，从而可以对其赋值。从这个角度说，RHS并不是真正意义上的赋值操作的左侧，更准去的说时“非左侧”。
**异常**
如果 RHS 查询在所有嵌套的作用域中遍寻不到所需的变量，引擎就会抛出 ReferenceError异常。值得注意的是，ReferenceError 是非常重要的异常类型。相较之下，当引擎执行 LHS 查询时，如果在顶层（全局作用域）中也无法找到目标变量，全局作用域中就会创建一个具有该名称的变量，并将其返还给引擎，前提是程序运行在非“严格模式”下。ES5 中引入了“严格模式”。同正常模式，或者说宽松 / 懒惰模式相比，严格模式在行为上有很多不同。其中一个不同的行为是严格模式禁止自动或隐式地创建全局变量。因此，在严格模式中 LHS 查询失败时，并不会创建并返回一个全局变量，引擎会抛出同 RHS 查询失败时类似的 ReferenceError 异常。接下来，如果 RHS 查询找到了一个变量，但是你尝试对这个变量的值进行不合理的操作，比如试图对一个非函数类型的值进行函数调用，或着引用 null 或 undefined 类型的值中的属性，那么引擎会抛出另外一种类型的异常，叫作 TypeError。
**ReferenceError 同作用域判别失败相关，而 TypeError 则代表作用域判别成功了，但是对结果的操作是非法或不合理的。**

## 词法作用域
大部分标准语言编译器的第一个工作阶段叫作词法化，词法化的过程会对源代码中的字符进行检查，如果是有状态的解析过程，还会赋予单词语义。**简单来说，词法作用域就是定义在词法阶段的作用域。换句话说，词法作用域是由在写代码时将变量和块作用域写在那里来决定的，因此当词法分析器处理代码时会保持作用域不变。**
```JS
var value = 1;

function foo() {
    console.log(value);
}

function bar() {
    var value = 2;
    foo();
}

bar();           //1
```
理解：词法作用域（静态作用域）是由程序所处的位置有关，foo()函数写在全局作用域下，虽然在bar()函数下调用，但由于JavaScript遵循词法作用域，因此foo()函数引用的是全局作用域下的value。
**欺骗词法**
JavaSprict中的eval()函数可以接收一个字符串为参数，并将其中的内容是为好像在书写时就存在与程序中这个位置的代码，换句话说，可以在写的代码中用程序生成代码运行，就好像代码是写在那个位置的一样。根据这个原理来理解eval(),它是如何通过代码欺骗和假装成书写时（也就是词法期）代码就在那，来实现修改词法作用域环境的，这个原理就变得清晰易懂了。
```Js
function foo(str, a) {
    eval(str)
    console.log(a,b)
}
var b = 2
foo('var b = 3', 1)          //1,3
```
eval()调用中的'var b = 3'这段代码会被当做本来就在那里一样来处理。由于那段代码声明了一个新的变量b，因此它对已经存在的foo()的词法作用域进行了修改，事实上，和前面提到的原理一样，这段代码实际上在foo()内部创建了一个变量b，并遮蔽了外部（全局）作用域中的同名变量。
**在这个例子中，为了展示的方便和简洁，我们传递进去的“代码”字符串是固定不变的。而在实际情况中，可以非常容易地根据程序逻辑动态地将字符拼接在一起之后再传递进去。eval(..) 通常被用来执行动态创建的代码，因为像例子中这样动态地执行一段固定字符所组成的代码，并没有比直接将代码写在那里更有好处。**
在严格模式的程序中，eval()在运行时有其自己的词法作用域，意味着其中的声明无法修改所在的作用域。
```JS
function foo(str) {
    'use strict'
    eval(str)
    console.log(a)                 //ReferenceError: a is not defined
}
foo('var a = 2')
```
JavaScript中还有其他一些功能效果和eval()很相似。setTimeout()和setInerval()的第一个参数可以是字符串，字符产的内容可以被解释为一段动态生成的函数代码。
new Function()函数的行为也很类似，最后一个参数可以接受代码字符串，并将其转化为动态生成的函数（前面的参数是这个新生成的函数的形参）。这种构建函数的语法比eval()略微安全些。
with 可以将一个没有或有多个属性的对象处理为一个完全隔离的词法作用域，因此这个对象的属性也会被处理为定义在这个作用域中的词法标识符。
尽管 with 块可以将一个对象处理为词法作用域，但是这个块内部正常的 var声明并不会被限制在这个块的作用域中，而是被添加到 with 所处的函数作用域中。
```JS
var object1 = {
	a: 1
}

with(object1) {
	var c = 3
	var a = 4
}
console.log(c)
console.log(object1.c)
console.log(object1.a)
console.log(a)
```
eval(..) 函数如果接受了含有一个或多个声明的代码，就会修改其所处的词法作用域，而with 声明实际上是根据你传递给它的对象凭空创建了一个全新的词法作用域。
可以这样理解，当我们传递 o1 给 with 时，with 所声明的作用域是 o1，而这个作用域中含有一个同 o1.a 属性相符的标识符。但当我们将 o2 作为作用域时，其中并没有 a 标识符，因此进行了正常的 LHS 标识符查找（查看第 1 章）。o2 的作用域、foo(..) 的作用域和全局作用域中都没有找到标识符 a，因此当 a＝2 执行时，自动创建了一个全局变量（因为是非严格模式）。
**另外一个不推荐使用 eval(..) 和 with 的原因是会被严格模式所影响（限制）。with 被完全禁止，而在保留核心功能的前提下，间接或非安全地使用eval(..) 也被禁止了。**
## 函数作用域
函数作用域的含义是指，属于这个函数的全部变量都可以在整个函数的范围内使用及复用（*事实上在嵌套的作用域中也可以使用*）。
### 隐藏内部实现
```JS
function doSomething(a) {
    b = a + doSomethingElse( a * 2 );
    console.log( b * 3 );
}
function doSomethingElse(a) {
    return a - 1;
}
var b;
doSomething( 2 ); // 15
```
变量 b 和函数 doSomethingElse(..) 应该是 doSomething(..) 内部具体实现的“私有”内容。给予外部作用域对 b 和 doSomethingElse(..) 的“访问权限”不仅没有必要，而且可能是“危险”的，因为它们可能被有意或无意地以非预期的方式使用，从而导致超出了 doSomething(..) 的适用条件。
```JS
// 利用隐藏内部实现的思想实现
function doSomething(a) {
    function doSomethingElse(a) {
        return a - 1;
    }
    var b;
    b = a + doSomethingElse( a * 2 );
    console.log( b * 3 );
}
doSomething( 2 ); // 15
```
现在，b 和 doSomethingElse(..) 都无法从外部被访问，而只能被 doSomething(..) 所控制。功能性和最终效果都没有受影响，但是设计上将具体内容私有化了，设计良好的软件都会依此进行实现。
## 规避冲突
“隐藏”作用域中的变量和函数所带来的另一个好处，是可以避免同名标识符之间的冲突，两个标识符可能具有相同的名字但用途却不一样，无意间可能造成命名冲突。冲突会导致变量的值被意外覆盖。
```JS
function foo() {
    function bar(a) {
        i = 3; // 修改 for 循环所属作用域中的 i
        console.log( a + i );
    }
    for (var i=0; i<10; i++) {
        bar( i * 2 ); // 糟糕，无限循环了！
    }
}
foo();

//修改
function foo() {
    function bar(a) {
        var i = 3; // 修改 for 循环所属作用域中的 i
        console.log( a + i );
    }
    for (var i=0; i<10; i++) {
        bar( i * 2 ); // 糟糕，无限循环了！
    }
}
foo();
```
**全局命名空间**
变量冲突的一个典型例子存在于全局作用域中。当程序中加载了多个第三方库时，如果它们没有妥善地将内部私有的函数或变量隐藏起来，就会很容易引发冲突。
这些库通常会在全局作用域中声明一个名字足够独特的变量，通常是一个对象。这个对象被用作库的命名空间，所有需要暴露给外界的功能都会成为这个对象（命名空间）的属
性，而不是将自己的标识符暴漏在顶级的词法作用域中。
```JS
var MyReallyCoolLibrary = {
    awesome: "stuff",
    doSomething: function() {
        // ...
    },
    doAnotherThing: function() {
        // ...
    }
}
```
**模块管理**
另外一种避免冲突的办法和现代的模块机制很接近，就是从众多模块管理器中挑选一个来使用。使用这些工具，任何库都无需将标识符加入到全局作用域中，而是通过依赖管理器的机制将库的标识符显式地导入到另外一个特定的作用域中。
显而易见，这些工具并没有能够违反词法作用域规则的“神奇”功能。它们只是利用作用域的规则强制所有标识符都不能注入到共享作用域中，而是保持在私有、无冲突的作用域中，这样可以有效规避掉所有的意外冲突。

### 函数作用域
利用函数作用域可以对变量和函数进行隐藏，但仍存在需要为函数命名以及函数运行的问题。
```JS
var a = 2;
(function foo(){ // <-- 添加这一行
    var a = 3;
    console.log( a ); // 3
})(); // <-- 以及这一行
console.log( a ); // 2
```
(function foo(){ .. }) 作为函数表达式意味着 foo 只能在 .. 所代表的位置中被访问，外部作用域则不行。foo 变量名被隐藏在自身中意味着不会非必要地污染外部作用域。
### 匿名和具名
对于函数表达式最首席的场景就是回调参数了，比如： 
```JS
setTimeout(function() {
    console.log('I waited 1 second!')
}, 1000)
```
这叫做匿名函数表达式，因为function()没有名称标识符。函数表达式可以是匿名的，而函数声明则不可以省略函数名。
匿名函数的缺点如下：
1.匿名函数在栈追踪中不会显示出有意义的函数名，使得调试很困难。
2.如果没有函数名，当函数需要应用自身时只能使用已经过期的arguments.callee引用，比如在递归中，另一个函数需要引用自身的例子，是在事件触发后事件监听器需要解绑自身。
3.匿名函数省略了对于代码可读性/可理解性很重要的函数名。
**行内函数表达式**非常强大且有用————匿名和具名之间的区别并不会对这点有任何影响。给函数表达式指定一个函数名可以有效解决以上问题
```JS
setTimeout( function timeoutHandler() { // <-- 快看，我有名字了！
    console.log( "I waited 1 second!" )
}, 1000 )
```
### 立即执行函数表达式
```JS
var a = 2;
(function foo() {
    var a = 3;
    console.log( a ); // 3
})();
console.log( a ); // 2
```
由于函数被包含在一对 ( ) 括号内部，因此成为了一个表达式，通过在末尾加上另外一个() 可以立即执行这个函数，比如 (function foo(){ .. })()。第一个 ( ) 将函数变成表
达式，第二个 ( ) 执行了这个函数。这种模式很常见，几年前社区给它规定了一个术语：IIFE，代表立即执行函数表达式（Immediately Invoked Function Expression）；
函数名对 IIFE 当然不是必须的，IIFE 最常见的用法是使用一个匿名函数表达式。虽然使用具名函数的 IIFE 并不常见，但它具有上述匿名函数表达式的所有优势，因此也是一个值得推广的实践。
```JS
var a = 2;
(function IIFE() {
    var a = 3;
    console.log( a ); // 3
})();
console.log( a ); // 2
```
我们将 window 对象的引用传递进去，但将参数命名为 global，因此在代码风格上对全局对象的引用变得比引用一个没有“全局”字样的变量更加清晰。当然可以从外部作用域传递任何你需要的东西，并将变量命名为任何你觉得合适的名字。这对于改进代码风格是非常有帮助的。
这个模式的另外一个应用场景是解决undefined标识符的默认值被错误覆盖导致的异常。将一个参数命名为undefined，但是在对应的场景不传入任何值，这样就可以保证代码块中undefined标识符的值真的是undefined；
```JS
undefined = true           //错误的
(function IIFE(undefined) {
    var a
    if (a === undefined) {
        console.log('undefined is safe here')
    }
})()
```
上述代码运行不通，这段代码要表达的意思是当undefined被错误赋值时，通过定义一个不传入参数的形参（undefined）来保证代码块中的undefined（此处为数据类型）是JavaScript中原始定义的undefined，保证代码安全。
IIFE 还有一种变化的用途是倒置代码的运行顺序，将需要运行的函数放在第二位，在 IIFE执行之后当作参数传递进去。这种模式在 UMD（Universal Module Definition）项目中被广泛使用。尽管这种模式略显冗长，但有些人认为它更易理解。
```JS
var a = 2
(function IIFE( def ) {
    def( window )
})(function def( global ) {
    var a = 3
    console.log( a ) // 3
    console.log( global.a) // 2
})
```
函数表达式 def 定义在片段的第二部分，然后当作参数（这个参数也叫作 def）被传递进IIFE 函数定义的第一部分中。最后，参数 def（也就是传递进去的函数）被调用，并将window 传入当作 global 参数的值。
## 块作用域
除 JavaScript 外的很多编程语言都支持块作用域，因此其他语言的开发者对于相关的思维方式会很熟悉，但是对于主要使用 JavaScript 的开发者来说，这个概念会很陌生。
```JS
for (var i=0; i<10; i++) {
    console.log( i )
}
console.log(i)             //10
```
### ES6中提供块级声明
块级声明也就是让所声明的变量在指定块的作用域外无法被访问。块级作用域（又被称为词法作用域）在如下情况被创建：
1. 在一个函数内部
2. 在一个代码块（由一对花括号包裹）内部
**let声明**
let可以将变量限制在当前代码块中，语法和var的一致，几乎可以利用let对var进行替代。
```JS
for (let i=0; i<10; i++) {
    console.log(i)
}
console.log(i)              //error
```
但let声明并不会尽进行提升
```Js
console.log(a)
let a = 2                  //error 
```
同时禁止重复声明
```Js
let a = 0
let a = 9

//分节
var a = 0
let a = 9
```
let能为垃圾收集提供帮助，考虑如下代码（现在考虑不明白，等看完闭包回来总结😂）
```Js
function process(data) {
// 在这里做点有趣的事情
}
var someReallyBigData = { .. };
process( someReallyBigData );
var btn = document.getElementById( "my_button" );
btn.addEventListener( "click", function click(evt) {
    console.log("button clicked");
}, /*capturingPhase=*/false );
```
click 函数的点击回调并不需要 someReallyBigData 变量。理论上这意味着当 process(..) 执行后，在内存中占用大量空间的数据结构就可以被垃圾回收了。但是，由于 click 函数形成了一个覆盖整个作用域的闭包，JavaScript 引擎极有可能依然保存着这个结构（取决于具体实现）。

```Js
function process(data) {
// 在这里做点有趣的事情
}
// 在这个块中定义的内容可以销毁了！
{
    let someReallyBigData = { .. };
    process( someReallyBigData );
}
var btn = document.getElementById( "my_button" );
btn.addEventListener( "click", function click(evt){
    console.log("button clicked");
}, /*capturingPhase=*/false );
```

**常量声明**
在ES6中也可以使用const语法进行声明。使用const声明的变量会被认为是常量（constant），意味着他们的值在被设置完成后就不能再被改变。因此所有的const变量都需要在声明时进行初始化。
常量声明与 let 声明一样，都是块级声明。这意味着常量在声明它们的语句块外部是无法访问的，并且声明也不会被提升，示例如下：
```Js
if (condition) {
    const maxItems = 5
}
console.log(maxItems)                 //error
```
与 let 的另一个相似之处，是 const 声明会在同一作用域（全局或是函数作用域）内定义一个已有变量时会抛出错误，无论是该变量此前是用 var 声明的，还是用 let 声明的。例如以下代码：
```Js
var message = "Hello!";
let age = 25;
const name = '007'
// 三者均会抛出错误
const message = "Goodbye!";
const age = 30;
const name = '008'
```
**使用const声明对象**
const 声明会阻止对于变量绑定与变量自身值的修改，这意味着 const 声明并不会阻止对变量成员的修改。例如：
```Js
const person = {
    name: 'Nicholas',
}
person.name = 'daming'                  //可以正常赋值
person = {
    name: 'daming'
}                                       //error
```
**只需记住： const 阻止的是对于变量绑定的修改，而不阻止对成员值的修改。**
**循环内的函数**
为实现输出1到9，考虑一下代码：
```Js
// 循环内使用var实现
var funcs = []
for （var i=0; i<10; i++) {
    funcs.push(function(i) {
        console.log(i)
    })
}
funcs.forEach(function(func) {
    func()                                  //输出数值'10'十次
})
// 由于输出函数并未立即执行，当通过数组调用时，输出函数输出的是对变量i的引用，此时i为10，因此输出10十次

var funcs = []
for (var i=0; i<10; i++) {
    funcs.push((function(value) {
        return function() {
            console.log(value)
        }
    }(i)))
}
funcs.forEach(function(func) {
    func()                              //输出0-9
})
//利用IIFE，变量i传递给匿名函数时被立即执行，创建了value变量作为i的副本

var funcs = [];
for (let i = 0; i < 10; i++) {
    funcs.push(function() {
        console.log(i);
    });
}
funcs.forEach(function(func) {
    func(); // 从 0 到 9 依次输出
})
```
**全局块级绑定**
let和const不同于var的另一个方面时在全局作用域上的表现。当全局作用于上使用var时，它会创建一个新的全局变量，并成为全局对象（浏览器中时window）的一个属性。这意味着var使用var可能会无意中覆盖一个已有的全局属性
```Js
var RegExp = 'hello'
console.log(window.RegExp)               //hello

var ncz = 'hi'
console.log(window.ncz)                 //hi
```
若在全局作用域上使用let或const，虽然在全局作用域上会创建新的绑定，但不会有任何属性被添加到全局对象上。这就意味着不能使用let或const来*覆盖*一个全局变量，只能将其*屏蔽*
```Js
let RegExp = 'hello'
console.log(RegExp)                              //hello
console.log(window.RegExp === RegExp)            //false

const ncz = 'hi'
console.log(ncz)                                 //hi
console.log('ncz' in window)                     //false
```

## 提升
函数作用域和块作用域的行为是一样的，可以总结为：任何声明在某个作用域内的变量，都将附属于这个作用域。
考虑如下代码：
```JS
a = 2
var a
console.log(a)            //2
```
由于在JavaScript中，包括变量和函数在内的所有声明都会在任何代码被执行前首先被处理。对于 var a = 2, JavaScript会将器堪称两个声明：var a和a = 2,第一个定义声明式在编译阶段进行的，第二个赋值声明会被*留在原地*等待执行阶段。
对于上面的代码，会被做如下处理：
```Js
var a
a = 2
console.log(a)
```
其中第一部分式编译，第二部分是执行。考虑另外一段代码：
```JS
console.log(a)        //undefined
var a = 2
console.log(b)        //ReferenceError: b is not defined
```
总结来说，这个过程就好像变量和函数声明从它们在代码中出现的位置被“移动”到了最上面。这个过程就叫作提升。对于函数，也存在变量提升：
```Js
foo()
function foo() {
    console.log(a)        //undefined
    var a = 2
}
```
这段代码经编译器处理后可以看作如下形式：
```Js
function foo() {
    var a
    console.log(a)         //undefined
    a = 2
}
foo()
```
可以看到，函数声明会被提升，但函数表达式却不会被提升。
```Js
foo()             //不是ReferenceError，而是TypeError
var foo = function bar()
    // ...
}
```
理解：这段程序中的变量标识符foo()被提升并分配给所在作用域（在这里是全局作用域），因此foo()不会导致ReferenceError。但是foo此时并没有赋值（如果它是一个函数声明而不是函数表达式，那么就会赋值）。foo()由于对undefined值进行函数调用而导致非法操作，因此抛出TypeError异常。
同时要记住，即使是具名的函数表达式，名称标识符在赋值之前也无法在所在作用域中使用：
```JS
foo()        //TypeError
bar()        //ReferenceError
var foo = function bar() {
    //...
}
// 这段代码会出现上述运行情况是经过提升后，会被理解为以下形式：
var foo
foo()             //TypeError
bar()             //ReferenceError
foo = function() {
    var bar = ...self...
    // ...
}
```
### 函数优先
函数声明和变量声明都会被提升，但是一个值得注意的细节（这个细节可以出现在有多个“重复”声明的代码中）是函数回首先被提升，然后才是变量。
考虑以下代码：
```Js
foo()             //1
var foo
function foo() {
    console.log(1)
}
foo = function() {
    console.log(2)
} 
```
会输出1而不是2，这个代码片段会被引擎理解为如下形式：
```Js
function foo() {
    console.log(1)
}
foo()              //
foo = function() {
    console.log(2)
}
```
注意，var foo 尽管出现在 function foo()... 的声明之前，但它是重复的声明（因此被忽略了），因为函数声明会被提升到普通变量之前。
```Js
foo()                //1     变量和函数提升，函数表达式没有提升
function foo() {
    console.log(1)
}
var foo = function() {
    console.log(2)
}
```
考虑如下代码：
```Js
foo()             //b
var a = true
if (a) {
    function foo() {
        console.log('a')
    }
} else {
    function foo() {
        console.log('b')
    }
}
```
由此可见，再块内部声明函数并不可靠，要避免。

## 作用域闭包
**当函数可以记住并访问所在的词法作用域时，就产生了闭包，即使函数是在当前词法作用域外执行。**
闭包概念：**当一个内部函数被调用，就会形成闭包，闭包就是能够读取其他函数内部变量的函数，定义在一个函数内部的函，创建一个闭包环境，让返回的这个子程序抓住i，以便在后续执行时可以保持对这个i的引用。内部函数比外部函数有更长的生命周期；函数可以访问它被创建时所处的上下文环境。**
考虑以下代码
```Js
function foo() {
    var a = 2
    function bar() {
        console.log(a)  
    }
    return bar
}
var baz = foo()
baz();      //2
```
函数 bar() 的词法作用域能够访问 foo() 的内部作用域。然后我们将 bar() 函数本身当作一个值类型进行传递。在这个例子中，我们将 bar 所引用的函数对象本身当作返回值。bar() 显然可以被正常执行。但是在这个例子中，它在自己定义的词法作用域以外的地方执行。
考虑如下程序：
```Js
var getNum;
function getCounter() {
    var n = 1; 
    var inner = function () { 
        return n++; 
    }
    return inner;
}

getNum = getCounter();
console.log(getNum());
console.log(getNum());

// dsadS
function f1(){
　　var n=999;
　　nAdd=function(){n+=1}
　　function f2(){
　　　　alert(n);
　　}
　　return f2;
}
var result=f1();
result(); // 999
nAdd();
result(); // 1000
```
分析如下循环代码，理解闭包：
```Js
for (var i=1; i<=5; i++) {
    setTimeout(function timer() {
        console.log(i)
    }), i*1000
}
```
这段代码预期是分别输出数字1-5，每秒一次，每次一个。但实际上，这段代码在运行时会以每秒一次的频率输出5次6。
这段代码的缺陷在于，我们假设循环中的每个迭代在运行时会给自己“捕获”一个i副本。但是根据作用域的工作原理，实际情况时尽管循环中的5个函数是在各个迭代中分别定义的，但是它们都被封闭在一个共享的全局作用域中，因此实际上只有一个i。循环的终止条件为i>5，条件首次成立时i的值是6。
换一种方式
```Js
for (var i=1; i<=5; i++) {
    (function() {
        setTimeout(function timer() {
            console.log(i)
        }, i*1000)
    })()
}
```
利用IIFE会通过声明并立即执行一个函数来创建作用域，但同样不能实现设想的输出，因为i并不在IIFE生成的作用域中，导致函数引用的i仍旧为全局作用域中的i。本质上这是将一个块转换成一个可以被关闭的作用域。
再换
```Js
for (var i=1; i<=5; i++) {
    (function() {
        var j = i
        setTimeout(function timer() {
            console.log(j)
        }, i*1000)
    })()
}
```
再换一种方式，结合块作用域和闭包：
```Js
for (var i=0; i<=5; i++) {
    let j = i
    setTimeout(function timer() {
        console.log(j)
    }, i*1000)
}
// 更简便的
for (let i=0; i<=5; i++) {
    setTimeout(function timer() {
        console.log(i)
    }, i*1000) 
}
```
### 模块
利用闭包实现模块，考虑如下代码：
```Js
function() {
    var something = 'cool'
    var another = [1, 2, 3]
    function doSomething() {
        console.log(something)
    }
    function doAnother() {
        console.log(another.join('i'))
    }
}
```
正如这段代码中显示的，这里并没有明显的闭包，只有两个私有数据变量something和another，以及doSomething()和doAnother()两个内部函数，它们的词法作用域（而就是闭包）也就是foo()的内部作用域。
考虑一下代码：
```Js
function CoolModule() {
    var something = 'cool'
    var another = [1, 2, 3]
    function doSomething() {
        console.log(something)
    }
    function doAnother() {
        console.log(another.join('!'))
    }
    return {
        doSomething: doSomething,
        doAnother: doAnother
    }
}
var foo = CoolModule()
foo.doSomething()       //cool
foo.doAnother()         //1!2!3
```
这个模式在 JavaScript 中被称为模块。最常见的实现模块模式的方法通常被称为模块暴露，这里展示的是其变体。
首先，CoolModule()只是一个函数，必须通过调用来创建一个模块实例。如果不执行外部函数，内部作用域和闭包都无法被创建。其次，CoolModule()返回一个用对象字面量语法{key: value}来表示的对象。这个返回的对象中含有对内部函数而不是内部数据变量的引用。我们保持内部数据变量是隐藏且私有的状态。可以将这个对象类型的返回值看作本质上是模块的公开API。
*从模块中返回一个实际的对象并不是必须的，也可以直接返回一个内部函数。jQuery 就是一个很好的例子。jQuery 和 $ 标识符就是 jQuery 模块的公共 API，但它们本身都是函数（由于函数也是对象，它们本身也可以拥有属性）。*
如果要更简单的描述，模块模式需要具备两个必要条件。
1. 必须有外部的封闭函数，该函数必须至少被调用一次（每次调用都会创建一个新的模块实例）。
2. 封闭函数必须返回至少一个内部函数，这样内部函数才能在私有作用域中形成闭包，并且可以访问或者修改私有的状态。

上一个示例代码中有一个叫作 CoolModule() 的独立的模块创建器，可以被调用任意多次，每次调用都会创建一个新的模块实例。当只需要一个实例时，可以对这个模式进行简单的
改进来实现单例模式：
```Js
var foo = (function CoolModule() {
    var something = "cool"
    var another = [1, 2, 3]
    function doSomething() {
        console.log( something )
    }
    function doAnother() {
        console.log( another.join( " ! " ) )
    }
    return {
    doSomething: doSomething,
    doAnother: doAnother
    }
})()
foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
```
模块也是普通的函数，因此可以接受参数：
```Js
function CoolModule(id) {
    function identify() {
        console.log( id )
    }
    return {
        identify: identify
    }
}
var foo1 = CoolModule( "foo 1" )
var foo2 = CoolModule( "foo 2" )
foo1.identify(); // "foo 1"
foo2.identify(); // "foo 2"
```
模块模式另一个简单但强大的变化用法是，命名将要作为公共 API 返回的对象：
```Js
var foo = (function CoolModule(id) {
    function change() {
    // 修改公共 API
        publicAPI.identify = identify2
    }
    function identify1() {
        console.log( id )
    }
    function identify2() {
        console.log( id.toUpperCase() )
    }
    var publicAPI = {
        change: change,
        identify: identify1
    }
    return publicAPI;
})( "foo module" );
foo.identify(); // foo module
foo.change();
foo.identify(); // FOO MODULE
```
通过在模块实例的内部保留对公共 API 对象的内部引用，可以从内部对模块实例进行修改，包括添加或删除方法和属性，以及修改它们的值。

现代模块机制
大多数模块依赖加载器 / 管理器本质上都是将这种模块定义封装进一个友好的 API。这里并不会研究某个具体的库，为了宏观了解我会简单地介绍一些核心概念：
```Js
var MyModules = (function Manager() {
    var modules = {}
    function define(name, deps, impl) {
        for (var i=0; i<deps.length; i++) {
            deps[i] = modules[deps[i]]
        }
        modules[name] = impl.apply(impl, deps)
    }
    function get(name) {
        return modules[name]
    }
    return {
        define: define,
        get: get
    }
})()
```
### 未来模块机制
***待整理***



## this词法
### 调用位置（存疑）
**以下书中所述和实际测试不符，利用var a = 2声明变量无法使a成为全局对象的属性**
调用位置就是函数在代码中被调用的位置（而不是声明的位置）。只有仔细分析调用位置才能回到这个问题：这个this到底引用的是什么。
通常来说，寻找调用位置就是寻找“函数被调用的位置”， 但是做起来并没有这么简单，因为某些编程模式可能会隐藏真正的调用位置。
最重要的是要分析调用栈（就是为了到达当前执行位置所调用的所有函数）。我们关心的调用位置就是在当前正在执行的函数的前一个调用中。
下面从一个例子中分析什么是调用栈和调用位置：
```Js
function baz() {
    // 当前调用栈是baz
    // 因此，当前调用位置是全局作用域
    console.log('baz')
    bar()  //<-- bar的调用位置
}
function bar() {
    // 当前调用栈是baz->bar
    // 因此，当前调用位置在baz中
    console.log('bar')
    foo() //<-- foo的调用位置
}
function foo() {
    // 当前调用栈是baz->bar->foo
    // 因此，当前调用位置在bar中
    console.log('foo')
}
baz()      //<-- baz的调用位置
```
### 绑定规则
#### 默认绑定
首先要介绍的是最常用的函数调用类型：独立函数调用。可以把这条规则看作是无法应用其他规则是的默认规则。
考虑以下代码：
```Js
function foo() {
    console.log(this.a)
}
var a = 2;
foo()   //2
```
声明在全局作用域中的变量（比如var a = 2）就是全局对象的一个同名属性。它们本质上就是同一个东西，并不是通过复制得到的。
分析调用位置，foo()是直接使用不带任何修饰的函数引用进行调用的，因此只能使用默认绑定。
如果使用严格模式（strict mode），那么全局对象将无法使用默认绑定，因此 this 会绑定到undefined：
```Js
function foo() {
    "use strict"
    console.log(this.a)
}
var a = 2
foo() //TypeError: this is undefined
```
这里有一个微妙但是非常重要的细节，虽然 this 的绑定规则完全取决于调用位置，但是只
有 foo() 运行在非 strict mode 下时，默认绑定才能绑定到全局对象；严格模式下与 foo()
的调用位置无关：
```Js
function foo() {
    console.log( this.a )
}
var a = 2;
(function(){
    "use strict"
    foo() // undefined
})()
```
#### 隐式绑定
另一条需要考虑的规则是调用位置是否有上下文对象，或者说是否被某个对象拥有或者包含，不过这种说法可能造成一些误解
考虑如下代码：
```Js
function foo() {
    console.log(this.a)
}
var obj = {
    a: 2,
    foo: foo
}
obj.foo() //2

var obj = {
	a: 2,
	foo: function() {
		console.log(this.a)
	}
}
obj.foo()
```
当foo()被调用时，它的落脚点确实指向obj对象。当函数引用有上下文对象时，隐式绑定规则会把函数调用中的this绑定到这个上下文对象。因为调用foo()时this被绑定到obj，因此this.a和obj.a是一样的
**对象属性引用链中只有最顶层（最后一层）会影响调用位置：
```Js
function foo() {
    console.log(this.a)
}
var obj2 = {
    a: 42,
    foo: foo
}
var obj1 = {
    a: 2,
    obj2: obj2
}
obj1.obj2.foo()  //42
```
**隐式丢失**
一个最常见的this绑定问题就是被饮食绑定的函数会丢失绑定对象，也就是说它会应用默认绑定，从而把this绑定到全局对象或者undefined上（取决于是否是严格模式）
考虑以下代码：
```Js
function foo() {
    console.log(this.a)
}
var obj = {
    a: 2,
    foo: foo
}
var bar = obj.foo
var a = 'oops, global'
bar()       //oops, global(sublime测试输出为undefined)
```
虽然bar是obj.foo的一个引用，但是实际上，它引用的是foo函数本身，因此此时的bar()其实是一个不带任何修饰的函数调用，因此应用了默认绑定。
```Js
function foo() {
    console.log(this.a)
}
function dooFoo(fn) {
    // fn其实引用的是foo
    fn()
}
var obj = {
    a: 2,
    foo: foo
}
var a = 'oops, global'
doFoo(obj.foo) //'oops, global
```
参数传递其实就是一种隐式赋值，因此我们传入函数时也会被隐式赋值，所以结果和上一个例子一样。
```Js
function foo() {
    console.log(this.a)
}
var obj = {
    a: 2,
    foo: foo
}
var a = "oops, global"
setTimeout(obj.foo,100)  //oops,global
```
#### 显示绑定
利用call和apply方法对this进行显示绑定，它们的第一个参数是一个对象，它们会把这个对象绑定到this，接着在调用函数时指定这个 this。因为你可以直接指定 this 的绑定对象，因此我们称之为显式绑定。
```Js
function foo() {
    console.log(this.a)
}
var obj = {
    a: 2
}
foo.call(obj)   //2
```
通过 foo.call(..)，我们可以在调用 foo 时强制把它的 this 绑定到 obj 上。
如果你传入了一个原始值（字符串类型、布尔类型或者数字类型）来当作 this 的绑定对象，这个原始值会被转换成它的对象形式（也就是 new String(..)、new Boolean(..) 或者new Number(..)）。这通常被称为“装箱”。
**从 this 绑定的角度来说，call(..) 和 apply(..) 是一样的，它们的区别体现在其他的参数上**
**硬绑定**
考虑以下代码：
```Js
function foo() {
    console.log( this.a )
}
var obj = {
    a:2
};
var bar = function() {
    foo.call( obj )
}
bar() // 2
setTimeout( bar, 100 ) // 2
// 硬绑定的 bar 不可能再修改它的 this
bar.call( window ) // 2
```
创建了函数 bar()，并在它的内部手动调用了 foo.call(obj)，因此强制把 foo 的 this 绑定到了 obj。无论之后如何调用函数 bar，它总会手动在 obj 上调用 foo。这种绑定是一种显式的强制绑定，因此我们称之为硬绑定。
硬绑定的典型应用场景就是创建一个包裹函数，传入所有的参数并返回接收到的所有值：
```Js
function foo(something) {
    console.log(this.a, something)
    return this.a + something
}
var obj = {
    a: 2
}
var bar = function() {
    return foo.apply(obj, arguments)
}
var b = bar(3)      //2, 3
console.log(b)      //5
```
另一种使用方法是创建一个可以重复使用的辅助函数：
```Js
function foo(something) {
    console.log(this.a, something)
    return this.a + something
}
// 简单的辅助绑定函数
function bind(fn, obj) {
    return function() {
        return fn.apply(obj, arguments)
    }
}
var obj = {
    a: 2
}
var bar = bind(foo, obj)
var b = bar(3)       //2 3
console.log(b)       //5
```
由于硬绑定是一种非常常用的模式，所以在ES5中提供了内置的方法Function.prototype.bind，它的用法如下：
```Js
function foo(something) {
    console.log(this.a, something)
    return this.a + something
}
var obj = {
    a: 2
}
var bar = foo.bind(obj)
var b = bar(3)        //2 3
console.log(b)        //5
```
bind()会返回一个硬绑定的新韩淑，他会把参数设置为this的上下文并调用原始函数。
**API调用的“上下文”**
第三方库的许多函数，以及 JavaScript 语言和宿主环境中许多新的内置函数，都提供了一
个可选的参数，通常被称为“上下文”（context），其作用和 bind(..) 一样，确保你的回调
函数使用指定的 this。
举例来说：
```Js
function foo(el) {
    console.log( el, this.id );
}
var obj = {
    id: "awesome"
};
// 调用 foo(..) 时把 this 绑定到 obj
[1, 2, 3].forEach( foo, obj );
// 1 awesome 2 awesome 3 awesome
```
这些函数实际上就是通过 call(..) 或者 apply(..) 实现了显式绑定，这样你可以少些一些代码。
#### new绑定
在传统的面向对象的语言中，“构造函数”是类中的一些特殊方法，使用new初始化类是会调用类中的构造函数，通常的形式是这样：
```Java
something = new MyClass()
```
JavaScript也有一个new操作符，使用方法看起来也和那些面向类的语言一样，绝大多数开发者人为JavaScript中new的机制也和那些语言一样，然而，JavaScript中new的机制实际上和面向类的语言完全不同。
首先重定义一下JavaScript中的“构造函数”。在JavaScript中，构造函数**只是一些使用new操作符时被调用的函数**。它们不会属于某个类，也不会实例化一个类。实际上，它们甚至都不能说是一种特殊的函数类型，它们只是被new操作符调用的普通函数而已。
举例来说，Number()作为构造函数时的行为，ES5.1中这样描述：
当Number在new表达式中被调用时，它是一个构造函数：它会初始化新创建的对象
所以，包括内置对象函数（比如Number()）在内的所有函数都可以用new来调用，这种函数调用被称为构造函数调用。这里有一个重要但是非常细微的区别：**实际上并不存在所谓的“构造函数”，只有对于函数的“构造调用”。**
使用new来调用函数，或者说发生构造函数调用时，会自动执行下面的操作
1.创建（或者说构造）一个全新的对象
2.这个新对象会被执行[[原型]]连接
3.这个新对象会被绑定到函数调用的this
4.如果函数没有返回其他对象，那么new表达式中的函数调用会自动返回这个新对象。
思考下面代码：
```Js
function foo(a) {
    this.a = a
}
var bar = new foo(2)
console.log(bar.a)    //2
```
**使用new来调用foo()时，我们会构造一个新对象并把它绑定到foo()调用中的this上。new是最后一种可以影响函数调用时this绑定行为的方法，我们称之为new绑定。**
### 优先级
考虑如下代码：
```Js
function foo() {
    console.log(this.a)
}
var obj1 = {
    a: 2,
    foo: foo
}
var obj2 = {
    a: 3,
    foo: foo
}
obj1.foo()   //2
obj2.foo()   //3

obj1.foo.call(obj2)    //3
obj2.foo.call(obj1)    //2
```
由此看到，显示绑定优先级更高，也就是说在判断时应当优先考虑是否可以应用显示绑定
接下来考虑new绑定和隐式绑定的优先级谁高谁低
```Js
function foo(something) {
    this.a = something
}
var obj1 = {
    foo: foo
}
var obj2 = {}

obj1.foo(2)
console.log(obj1.a)   //2

obj1.foo.call(obj2, 3)
console.log(obj2.a)   //3

var bar = new obj1.foo(4)
console.log(obj1.a)     //2
console.log(bar.a)      //4
```
可以看到 new 绑定比隐式绑定优先级高。
考虑如下代码：
```Js
function foo(something) {
    console.log(this)
    this.a = something
}
var obj1 = {}
var bar = foo.bind(obj1)
bar(2)
console.log(obj1.a)   //2

var baz = new bar(3)
console.log(obj1.a)   //2
console.log(baz.a)    //3
```
事实上，new并没有改变obj1的a，二是修改了硬绑定（到obj1的）调用bar()中的this
**判断this**
可以根据优先级来判断函数在某个调用位置应用的是那条规则。按下面的顺序来进行判断：
1.函数是否在new中调用（new绑定）。如果时的话，this绑定的是新创建的对象。
var bar = new foo()
2.函数是否通过call、apply（显示绑定）或者硬绑定调用。如果是的话，this绑定的是指定的对象。
var bar = foo.bind(obj2)
3.函数是否在某个上下文对象中调用（隐式绑定）。如果是的话，this绑定的是那个上下文对象。
var bar = obj1.foo
4.如果都不是的话，使用默认绑定。如果在严格模式下，就绑定到undefined，否则绑定到全局对象。
var bar = foo

### 绑定例外
当把null或者undefined作为this的绑定对象传入call、apply或者bind，这些值在调用时会被忽略，实际应用的是默认绑定规则：
```Js
function foo() {
    console.log(this.a)
}
var a = 2
foo.call(null)  //2
```
传入null的情景：
一种非常常见的做法是使用apply()来“展开”一个数组，并当作参数传入一个函数。类似的，bind()可以对参数进行柯里化（预先设置一些参数）：
```Js
function foo(a, b) {
    console.log("a:" + a + ", b:" + b)
}
// 把数组“展开”成参数
foo.apply(null, [2,3])  //a:2,b:3

// 使用bind()进行柯里化
var bar = foo.bind(null, 2)
bar(3)
```
这两种方法都需要传入一个参数当作 this 的绑定对象。如果函数并不关心 this 的话，仍然需要传入一个占位值，这时 null 可能是一个不错的选择，就像代码所示的那样。
在 ES6 中，可以用 ... 操作符代替 apply(..) 来“展开”数组，foo(...[1,2]) 和 foo(1,2) 是一样的，这样可以避免不必要的this 绑定。可惜，在 ES6 中没有柯里化的相关语法，因此还是需要使用bind(..)。

然而，总是使用 null 来忽略 this 绑定可能产生一些副作用。如果某个函数确实使用了this（比如第三方库中的一个函数），那默认绑定规则会把 this 绑定到全局对象（在浏览器中这个对象是 window），这将导致不可预计的后果（比如修改全局对象）。显而易见，这种方式可能会导致许多难以分析和追踪的 bug。
**更安全的this**
一种“更安全”的做法是传入一个特殊的对象，把 this 绑定到这个对象不会对你的程序产生任何副作用。就像网络（以及军队）一样，我们可以创建一个“DMZ”（demilitarized
zone，非军事区）对象——它就是一个空的非委托的对象（委托在第 5 章和第 6 章介绍）。如果我们在忽略 this 绑定时总是传入一个 DMZ 对象，那就什么都不用担心了，因为任何对于 this 的使用都会被限制在这个空对象中，不会对全局对象产生任何影响。在 JavaScript 中创建一个空对象最简单的方法都是 Object.create(null)。Object.create(null) 和 {} 很 像， 但 是 并 不 会 创 建 Object.prototype 这个委托，所以它比 {}“更空”：
```Js
function foo(a,b) {
    console.log( "a:" + a + ", b:" + b );
}
// 我们的 DMZ 空对象
var ø = Object.create( null );
// 把数组展开成参数
foo.apply( ø, [2, 3] ); // a:2, b:3
// 使用 bind(..) 进行柯里化
var bar = foo.bind( ø, 2 );
bar( 3 ); // a:2, b:3
```
使用变量名 ø 不仅让函数变得更加“安全”，而且可以提高代码的可读性，因为 ø 表示“我希望 this 是空”，这比 null 的含义更清楚。不过再说一遍，你可以用任何喜欢的名字
来命名 DMZ 对象。

#### 间接引用
另一个需要注意的是，有可能创建一个“间接引用”，在这种情况下，调用这个函数会应用默认绑定规则。
间接引用最容易发生在赋值时：
```Js
function foo() {
    console.log(this.a)
}
var a = 2
var o = {
    a: 3,
    foo: foo
}
var p = {
    a: 4
}

o.foo()    //3
(p.foo = o.foo)()  //2
```
赋值表达式 p.foo = o.foo 的返回值是目标函数的引用，因此调用位置是 foo() 而不是p.foo() 或者 o.foo()。根据我们之前说过的，这里会应用默认绑定。
注意：对于默认绑定来说，决定 this 绑定对象的并不是调用位置是否处于严格模式，而是函数体是否处于严格模式。如果函数体处于严格模式，this 会被绑定到 undefined，否则this 会被绑定到全局对象。
#### 软绑定
硬绑定会大大降低函数的灵活性，使用硬绑定之后就无法使用隐式绑定或者显式绑定来修改 this。
如果可以给默认绑定指定一个全局对象和 undefined 以外的值，那就可以实现和硬绑定相同的效果，同时保留隐式绑定或者显式绑定修改 this 的能力。
可以通过一种被称为软绑定的方法来实现我们想要的效果：
```Js
if(!Function.prototype.softBind) {
    Function.prototype.softBind = function(obj) {
        var fn = this
        // 捕获所有curried参数
        var curried = [].slice.call(arguments, 1)
        var bound = function() {
            return fn.apply(
                (!this || this === (window || global))?
                    obj : this
                curried.concat.apply(curried, arguments)
            )
        }
        bound.prototype = Object.create(fn.prototope)
        return bound
    }
}
```
除了软绑定之外，softBind(..) 的其他原理和 ES5 内置的 bind(..) 类似。它会对指定的函数进行封装，首先检查调用时的 this，如果 this 绑定到全局对象或者 undefined，那就把指定的默认对象 obj 绑定到 this，否则不会修改 this。此外，这段代码还支持可选的柯里化
```Js
function foo() {
    console.log("name: " + this.name)
}
var obj = {name: 'obj'},
    obj2 = {name: 'obj2'}
    obj3 = {name: 'obj3'}
var fooOBJ = foo.softBind(obj)
fooOBJ()    //name: obj
obj2.foo = foo.softBind(obj)
obj2.foo()         //name: obj2
fooOBJ.call(obj3)  //name: obj3
setTimeout(obj2.foo, 10)
// name: obj
```
可以看到，软绑定版本的 foo() 可以手动将 this 绑定到 obj2 或者 obj3 上，但如果应用默认绑定，则会将 this 绑定到 obj。

### this词法
之前介绍的四条规则已经可以包含所有正常的函数。但是ES6中介绍了一种无法使用这些规则的特殊函数类型：箭头函数
箭头函数不使用 this 的四种标准规则，而是根据外层（函数或者全局）作用域来决定 this。
```Js
function foo() {
    return (a) => {
        // this继承自foo()
        console.log(this.a)
    }
}
var obj1 = {
    a: 2
}
var obj2 = {
    a: 3
}
var bar = foo.call(obj1)
bar.call(obj2)         //2
```
foo() 内部创建的箭头函数会捕获调用时 foo() 的 this。由于 foo() 的 this 绑定到 obj1，bar（引用箭头函数）的 this 也会绑定到 obj1，箭头函数的绑定无法被修改。（new 也不行！）
箭头函数最常用于回调函数中：
```Js
function foo() {
    setTimeout(() => {
        // 这里的this在词法上继承自foo()
        console.log(this.a)
    }, 100)
}
var obj = {
    a: 2
}
foo.call(obj)   //2
```
箭头函数可以像 bind(..) 一样确保函数的 this 被绑定到指定对象，此外，其重要性还体现在它用更常见的词法作用域取代了传统的 this 机制。实际上，在 ES6 之前我们就已经在使用一种几乎和箭头函数完全一样的模式。
```Js
function foo() {
    var self = this
    setTimeout(function() {
        console.log(self.a)
    }, 100)
}
var obj = {
    a: 2
}
foo.call(obj)    //2
```
```Js
function foo() {
    // var self = this
    setTimeout(function() {
        console.log(this.a)
    }, 100)
}
var obj = {
    a: 2
}
foo.call(obj)    //undefined
```


