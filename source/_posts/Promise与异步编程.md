---
title: Promise与异步编程
tags: JavaScript
---

JS最强大的一方面就是它能极其轻易地处理异步编程。作为因为互联网而生的语言，JS从一开始就必须能够响应点击或按键之类的用户交互行为。Node.js通过使用回调函数来代替事件，进一步推动了JS中的异步编程。随着越来越多的程序开始使用异步编程，事件与回调函数已不足以支持开发者的所有需求。Promise正是为了解决这方面的问题。
Promise是异步编程的另一种选择，它的工作方式类似于在其他语言中延迟并在将来执行作业。一个Promise指定一些要稍后执行的代码（就像事件与回调函数一样），并且也明确标示了作业的代码是否执行成功。能以成功处理或失败处理为基准，将Promise串联在一起，让代码更容易理解，更易调试。
## 异步编程的背景
JS引擎建立在单线程事件循环的概念上。单线程（Single-threaded）意味着同一时刻只能执行一段代码，与Java或C++这种允许同时执行多段不同代码的多线程语言形成了反差。多段代码可以同时访问或修改状态，委会并保护这些状态就变成了难题，这也是基于多线程的软件中出现bug的常见根源之一。
JS引擎在同一时刻只能执行一段代码，所以引擎无需留意那些“可能”运行的代码。代码会被放置在作业队列（job queue）中，每当一段代码准备执行，它就会被添加到作业队列。当JS引擎结束当前代码的执行后，事件循环就会执行队列中的写一个作业。事件循环（event loop）是JS引擎的一个内部处理线程，能监视代码的执行并管理作业队列。要记住，既然是一个队列，作业就会从队列中的第一个开始，一次运行到最后一个。

### 事件模型
当用户点击一个按钮或按下键盘上的一个键时，一个事件（event）--例如 onclick --就被触发了。该事件可能会对此交互进行响应，从而将一个新的作业添加到作业队列的尾部。这就是JS关于异步编程的最基本形式。时间处理程序代码直到事件发生后才会被执行，此时它会拥有合适的上下文。
```Js
let button = documet.getElementById('my-btn')
button.onclick = function(event) {
    console.log('Clicked')
}
```
此代码中，console.log('Clicked')直到button被点击后才会被执行。当button被点击，赋值给onclick的函数就被添加到作业队列的尾部，并在队列前部所有任务结束之后再执行。
事件可以很好地工作于简单的交互，但将多个分离的异步调用串联在一起却会很麻烦，因为必须追踪每个事件的事件对象（例如上例中的button）。此外，还须确保所有的事件处理程序都能在事件第一次触发之前被绑定完毕。例如，若button在onclick被绑定之前就被点击，那就不会有任何事发生。因此虽然在响应用户交互或类似的低频功能时。事件很有用，但它在面对更复杂的需求时仍然不够灵活。

### 回调模式
当Node.js被创建时，它通过普及回调函数编程模式提升了异步编程模型。回调函数模式类似于事件模型，因为衣不带吗也会在会面的一个时间点才执行。不同之处在于需要调用的函数（即回调函数）时作为参数传入的，如下所示：
```Js
readFile('example.txt', function(err, contents) {
    if (err) {
        throw err
    }
    console.log(contents)
})
console.log('hi')
```
此例中使用了Node.js惯例，即错误优先（error-first）的回调函数风格。readFile()函数用于读取磁盘中的文件（由第一个参数指定），并在读取完成后执行回调函数（即第二个参数）。如果存在错误，回调函数的err参数回事一个错误对象；否则contents擦书就会以字符串形式包含文件内容。
使用回调函数模式，readFile()会立即开始执行，并在开始读取磁盘时暂停。这意味着console.log('hi')会在readFile()被调用后立即进行输出，要早于console.log(contents)的打印操作。当readFile()结束操作后，它会将回调函数以及相关参数作为一个新的作业添加到作业队列的尾部。在之前的作业全部结束后，改作业才会执行。
回调函数模式要比事件模型灵活得多，因为使用回调函数串联多个调用会相对容易。
```Js
readFile('example.txt', function(err, contents) {
    if (err) {
        throw err
    }

    writeFile('example.txt', function(err) {
        if (err) {
            throw err
        }
        console.log('File was written')
    })
})
```
在此代码中，对于readFile()的第一次成功调用引出了另一个异步调用，即调用writeFile()函数。注意这两个函数都使用了检查err的统一基本模式。当readFile()执行结束后，它添加一个作业到作业队列，从而导致writeFIle()在之后被调用（假设没有出现错误）。接下来，writeFile()也会在执行结束后项队列添加一个作业。
这种模式运作得相当好，但你可能会迅速察觉陷入了回调地狱（ callback hell ），这会在嵌
套过多回调函数时发生，就像这样：
```Js
method1(function(err, result) {
    if (err) {
        throw err
    }
    method2(function(err, result) {
        if (err) {
            throw err
        }
        method3(function(err, result) {
            if (err) {
                throw err
            }
            method4(function(err, result) {
                if (err) {
                    throw err
                }
                method5(result)
            })
        })
    })
})
```
## Promise基础
**Promise是为异步操作的结果所准备的占位符。**函数可以返回一个Promise，而不必订阅一个事件或向函数传递一个回调参数，形式如下：
```Js
let promise = readFile('example.txt')
```
在此代码中，readFile()实际上并未立即开始读取文件，这将会在稍后发生。此函数反而会返回一个Promise对象仪表室异步读取操作，因此可以在奖励啊再操作它。能对结果进行操作的确切时刻，完全取决于Promise的声明周期是如何进行的。

### Promise的声明周期
每个Promise都会经历一个短暂的声明周期，出事为挂起态（pending state)，这表示异步操作尚未结束。一个挂起的Promise也被认为是未决的（unsettled）。上个例子中的Promise在readFile()函数返回它的时候就是出于挂起态。一旦异步操作结束，Promise就会被认为是已决的（settled），并进入两种可能状态之一。
1.已完成（fulfilled）：Promise的异步操作已成功结束；
2.已拒绝（rejected）：Promise的异步操作未成功结束，可能是一个错误，或有其他原因导致。
内部的[[PromiseState]]属性会被设置为"pending","fulfilled"或"rejected"，以反映Promise的状态。该属性并未在Promise对象上被暴露出来，因此无法已变成方式判断Promise到底处于哪种状态。不过可以使用then方法在Promise的状态改变时执行一些特定操作。
以下为Promise相关词汇的翻译：
1. pending ：挂起，表示未结束的 Promise 状态。相关词汇“挂起态”。
2. fulfilled ：已完成，表示已成功结束的 Promise 状态，可以理解为“成功完成”。相关
词汇“完成”、“被完成”、“完成态”。
3. rejected ：已拒绝，表示已结束但失败的 Promise 状态。相关词汇“拒绝”、“被拒
绝”、“拒绝态”。
4. resolve ：决议，表示将 Promise 推向成功态，可以理解为“决议通过”，在 Promise
概念中与“完成”是近义词。相关词汇“决议态”、“已决议”、“被决议”。
5. unsettled ：未决，或者称为“未解决”，表示 Promise 尚未被完成或拒绝，与“挂
起”是近义词。
6. settled ：已决，或者称为“已解决”，表示 Promise 已被完成或拒绝。注意这与“已完
成”或“已决议”不同，“已决”的状态也可能是“拒绝态”（已失败）。
7. fulfillment handler ：完成处理函数，表示 Promise 为完成态时会被调用的函数。
8. rejection handler ：拒绝处理函数，表示 Promise 为拒绝态时会被调用的函数。

then()方法在所有的Promise上都存在，并且接受两个参数。第一个参数是Promise被完成时要调用的函数，与异步操作关联的任何附加数据都会被传入这个完成函数。第二个参数则是Promise被拒绝时要调用的函数，与完成函数相似，拒绝函数会被传入与拒绝相关联的任何附加数据。
这种方式实现then()防范的任何对象都被称为一个thenable。所有的Promise都是thenable，繁殖则未必成立。
传递个then()的两个参数都是可选的，因此你可以监听完成与拒绝的任意组合形式。例如研究这组then()调用： 
```Js
let promise = readFile('exapmle.txt')
promise.then(function(contents) {
    // 完成
    console.log(contents)
}, function(err) {
    // 拒绝
    console.error(err.message)
})

promise.then(function(contents) {
    // 完成
    console.log(contents)
})

promise.then(null, function(err) {
    // 拒绝
    console.error(err.message)
})
```

这三个then()调用都操作在同一个Promise上。第一个调用同时监听了完成与失败；第二个调用只监听了完成，错误不会被报告；第三个则只监听了拒绝，并不报告成功信息。
Promise也具有一个catch()方法，其行为等同于值传递拒绝函数给then()。例如，以下的catch()与then()调用时功能等效的。
```Js
promise.catch(function(err) {
    console.error(err.message)
})

promise.then(null, function(err) {
    console.error(err.message)
})
```
then()与catch()背后的意图是能组合使用来正确处理异步操作的结果。此系统要优于事件与回调函数，因为它让操作是成功还是失败变得完全清晰（事件模式倾向于在出错时不被触发，而在回调函数模式中你必须始终记得检查错误参数）。只需知道若未给出Promise附加拒绝处理函数，所有的错误就会静默发生。建议始终附加一个拒绝处理函数，及时该程序只是用于打印错误日志。
及时完成或拒绝处理函数在Promise已经被解决之后才添加到作业队列，它们仍然会被执行。这允许你随时添加新的完成或拒绝处理函数，并保证它们会被调用：
```Js
let promise = readFile('example,txt')
promise.then(function(contents) {
    console.log(contents)
    promise.then(function(contents) {
        console.log(contents)
    })
})
```
此代码中，完成处理函数又为同一个Promise添加了另一个完成处理函数。这个Promise此刻已经完成了，因此新的处理程序就被添加到任务队列，并在就绪时（前面的作业执行完毕后）被调用。拒绝处理函数使用同样方式工作。

每次调用then()或catch()都会创建一个新的作业，它会在Promise已决议时被执行。但这些作业最终会进入一个完全为Promise保留的作业队列。

### 创建未决的Promise
新的Promise使用Promise构造器来创建。此构造器接受单个参数：一个被称为执行器（executor）的函数，包含初始化Promise的代码。该执行器挥别传递两个名为resolve与reject()的函数作为参数。resolve()函数在执行器成功结束时被调用，由于示意该Promise已经准备好被决议（resolved），而reject()函数则表明执行器的操作已失败。下为范例：
```Js
let fs = require('fs')
function readFile(fileName) {
    return new Promise(function(resolve, reject) {
        fs.readFile(fileName, {encoding: 'utf8'}, function(err, contents) {
            if(err) {
                reject(err)
                return
            }
            resolve(contents)
        })
    })
}

let promise = readFile("example.txt");
// 同时监听完成与拒绝
promise.then(function(contents) {
// 完成
console.log(contents)
}, function(err) {
// 拒绝
console.error(err.message)
})
```
在此例中，Node.js原生的fs.readFile()异步调用被包装在一个Promise中。执行器要么传递错误对象给reject()函数，要么传递文件内容给resoleve()函数。
要记住执行器会在readFile()被调用时立即运行。当resolve()或reject()在执行器内部被调用时，一个作业被添加到作业队列中，以便决议（resolve）这个Promeise。这被称为作业调度（job scheduling）。作业调度中，添加新作业到队列中时表示：“不要立刻执行这个作业，但要在稍后执行它”。

```Js
// 通过以下代码理解promise的执行顺序
let fs = require('fs')
function readFile(fileName) {
    console.log('hhh')
    return new Promise(function(resolve, reject) {
        console.log('lll')
        // fs.readFile(fileName, {encoding: 'utf8'}, function(err, contents) {
        //     console.log('%%%%%%%%%%%%%%%%%')
        //     if(err) {
        //         reject(err)
        //         return
        //     }
        //     resolve(contents)
        // })
        resolve(123)
        console.log(456)
    })
}

let promise = readFile("example.txt")
console.log('mimashiduoshao')
// 同时监听完成与拒绝
promise.then(function(contents) {
// 完成
console.log(contents)
}, function(err) {
// 拒绝
console.error(err.message)
})
console.log('woshimima')
```
输出为：
hhh
lll
456
mimashiduoshao
woshimima
123

### 创建已决的Promise
基于Promise执行器行为的动态本质，Promise构造器就是创建未决的Promise的最好方法。但若想让一个Promise代表一个一直的值，那额安排一个淡出传值给resolve()函数的作业并没有意义。相反，有两种方法可以使用指定值来创建已决的Promise

#### 使用Promise.resolve()
Promise.resolve()方法接受单个参数并会返回一个处于完成态的Promise。这意味着没有任何作业调度会发生，并且需要向PRomise添加一个或更多的完成处理函数来提取这个参数值。
```Js
let promise = Promise.resolve(42)

promise.then(function(value) {
    console.log(value)
})
```
此代码创建了一个已完成的Promise，因此完成处理函数就接收到42作为value参数。若一个拒绝处理函数被添加到此Promise，该拒绝处理函数将永不会被调用，因为此Promise绝不可能时拒绝态

#### 使用Promise.reject()
可以使用Promise.reject()方法来创建一个已拒绝的Promise。此方法向Promise.resolve()一样工作，区别是被创建的Promise处于拒绝态
```Js

let promise = Promise.reject(420)
promise.catch(function(value) {
    console.log(value)
})
```
任何附加到这个Promise的拒绝处理函数都将会被调用，而完成处理函数则不会执行。

若你传递一个 Promise 给 Promise.resolve() 或 Promise.reject() 方法，该 Promise
会不作修改原样返回。
译注： 经过测试，在几大浏览器中都存在与上一句话不符的情况。
1. 若传入的 Promise 为挂起态，则 Promise.resolve() 调用会将该 Promise 原样返
回。此后，若决议原 Promise ，在 then() 中可以接收到原例中的参数 42 ；而若
拒绝原 Promise ，则在 catch() 中可以接收到参数 42 。 但 Promise.reject()
调用则会对原先的 Promise 重新进行包装，对其使用 catch() 可以捕捉到错误，
处理函数中的 value 参数不会是数值 42 ，而是原先处于挂起态的 Promise 。
2. 若传入的 Promise 为完成态，则 Promise.resolve() 调用会将该 Promise 原样返
回，在 then() 中可以接收到原例中的参数 42 。 但 Promise.reject() 调用则会
对原先的 Promise 重新进行包装，对其使用 catch() 可以捕捉到错误，处理函数
中的 value 参数不会是数值 42 ，而是原先处于完成态的 Promise 。
3. 若传入的 Promise 为拒绝态，则 Promise.reject() 调用会将该 Promise 原样返
回，在 catch() 中可以接收到参数 42 。 但 Promise.resolve() 调用则会对原先
的 Promise 重新进行包装，对其使用 then() 可以进行完成处理，处理函数中的
value 参数不是 42 ，而是原先处于拒绝态的 Promise 。也就是说此时的情况与
上一种情况相反。
总结：对挂起态或完成态的 Promise 使用 Promise.resolve() 没问题，会返回原
Promise ；对拒绝态的 Promise 使用 Promise.reject() 也没问题。而除此之外的情况全
都会在原 Promise 上包装出一个新的 Promise 。
**实际测试**
```js
function testFunction() {
	return new Promise(function(resolve, reject) {
		if (1 === '1') {            //写的有点别扭
			reject(0)
		}
		resolve(1)
	})
}

let promiseResol = Promise.resolve(11)
let promiseRej = Promise.resolve(12)

let promise = testFunction()

let returnP = Promise.resolve(promise)
let returnPRej = Promise.reject(promise)
let returnP1 = Promise.resolve(promiseResol)
let returnPRej1 = Promise.reject(promiseResol)
let returnP2 = Promise.resolve(promiseRej)
let returnPRej2 = Promise.reject(promiseRej)

returnP.then(val => {
	console.log('returnPthen' + val)    //returnPthen1
})
.catch(val => {
	console.log('returnPcatch' + val)
})

returnPRej.then(val => {
	console.log('returnPRejthen' + val)
})
.catch(val => {
	console.log('returnPRejcatch' + val)         ////returnPRejcatch[object Promise]
	val.then(val => {
		console.log('then' + val)                //then1
	})
	.catch(val => {
		console.log('catch' + val)
	})
})

returnP1.then(val => {
	console.log('returnP1then' + val)        //returnP1then11
})
.catch(val => {
	console.log('returnP1catch' + val)
})

returnPRej1.then(val => {
	console.log('returnPRej1then' + val)       
	val.then(val => {
		console.log('then' + val)
	})
	.catch(val => {
		console.log('catch' + val)
	})
})
.catch(val => {
	console.log('returnPRej1catch' + val)    //returnPRej1catch[object Promise]
	val.then(val => {
		console.log('then' + val)            //then11
	})
	.catch(val => {
		console.log('catch' + val)
	})
})

returnP2.then(val => {
	console.log('returnP2then' + val)            //returnP2then12
})
.catch(val => {
	console.log('returnP2catch' + val)
})

returnPRej2.then(val => {
	console.log('returnPRej2then' + val)
	val.then(val => {
		console.log('then' + val)
	})
	.catch(val => {
		console.log('catch' + val)
	})
})
.catch(val => {
	console.log('returnPRej2catch' + val)         //returnPRej2catch[object Promise]
	val.then(val => {
		console.log('then' + val)                 //then12
	})
	.catch(val => {
		console.log('catch' + val)
	})
})
```
输出结果
returnPthen1
returnP1then11
returnP2then12
returnPRejcatch[object Promise]
returnPRej1catch[object Promise]
returnPRej2catch[object Promise]
then1
then11
then12
**当时用Promise.resolve()时，无论输入的promise是什么状态，都会返回promise，并且该promise的状态是已完成，结果是传入的promise的返回（完成或者拒绝），即都通过then返回。当时用Promise.reject()时，不论什么状态，都会在catch中返回一个promise，传入的promise为已决，则结果从该promise的then输出，若传入的promise为未决，则根据promise决议的结果从then或者catch返回。**

非Promise的Thenable
Promise.resolve()与Promise.reject()都能接受非Promise的thenable作为参数。当传入了非Promise的thenable时，这些方法会创建一个新的Promise，此Promise会在then函数之后被调用。
当一个对象拥有一个能接受resolve与reject参数的then()方法，该对象就会被认为是一个非Promise的thenable：
```Js
let thenable = {
    then: function(resolve, reject) {
        resolve(42)
    }
}

let p1 = Promise.resolve(thenable);
p1.then(function(value) {
    console.log(value); // 42
})
```

#### 执行器错误
如果在执行器内部抛出了错误，那么Promise的拒绝处理函数就会被调用。
```Js
let promise = new Promise(function(resolve, reject) {
    throw new Error('explosion!')
})

promise.catch(function(error) {
    console.log(error.message)       //'explosion'
})

// 等价于
let promise = new Promise(function(resolve, reject) {
    try {
        throw new Error("Explosion!")
    } catch (ex) {
        reject(ex)
    }
})
promise.catch(function(error) {
    console.log(error.message); // "Explosion!"
})
```
执行器处理程序捕捉了抛出的任何错误，以简化这种常见处理。但在执行器内抛出的错误仅
当存在拒绝处理函数时才会被报告，否则这个错误就会被隐瞒。这在开发者早期使用
Promise 的时候是一个问题，但 JS 环境通过提供钩子（ hook ）来捕捉被拒绝的 Promise ，
从而解决了此问题。

### 全局的Promise拒绝处理
Promise最有争议的方面之一就是：当一个Promise被拒绝时若缺少拒绝处理函数，就会静默失败。有人认为这是规范中最大的缺陷，因为这是JS语言左右组成部分中唯一不让错误清晰可见的。
由于Promise的本质，判断一个Promise的拒绝是否已被处理并不直观。
```Js
let reject = Promise.reject(42)

// 在此刻rejected不会被处理
// 一段时间后
reject.catch(function(value) {
    console.log(value)
})
```
无论Promise是否已被解决，都可以在任何时候调用then()或catch()并使它们正确工作，这导致很难准确知道一个Promise合适会被处理。此例中的Promise被立刻拒绝，但它后来才被处理。
虽然下个版本的 ES 可能会处理此问题，不过浏览器与 Node.js 已经实施了变更来解决开发者
的这个痛点。这些变更不是 ES6 规范的一部分，但却是使用 Promise 时的宝贵工具。

### Node.js的拒绝处理
在Node.js中，process对象上存在两个关联到Promise的拒绝处理事件：
unhandledRejection：当一个Promise被拒绝，而在事件循环的一个轮次中没有任何拒绝处理函数被调用，改时间就会被触发；
rejectionHandled：若一个Promise被拒绝、并在时间循环的一个轮次之后再有拒绝处理函数被调用，该事件就会被触发。
这两个事件旨在共同帮助识别已被拒绝但未曾处理promise。
unhandledRejection 事件处理函数接受的参数是拒绝原因（常常是一个错误对象）以及已被
拒绝的 Promise 。以下代码展示了 unhandledRejection 的应用：
```Js
let rejected
process.on("unhandledRejection", function(reason, promise) {
    console.log(reason.message); // "Explosion!"
    console.log(rejected === promise); // true
})
rejected = Promise.reject(new Error("Explosion!"))
```

此例创建了一个带有错误对象的已被拒绝的 Promise ，并监听了 unhandledRejection 事件。事件处理函数接收了该错误对象作为第一个参数，原 Promise 则是第二个参数。rejectionHandled 事件处理函数则只有一个参数，即已被拒绝的 Promise 。例如：
```Js
let rejected
process.on("rejectionHandled", function(promise) {
    console.log(rejected === promise) // true
})
rejected = Promise.reject(new Error("Explosion!"))
// 延迟添加拒绝处理函数
setTimeout(function() {
    rejected.catch(function(value) {
        console.log(value.message); // "Explosion!"
    })
}, 1000)
```
此处的 rejectionHandled 事件在拒绝处理函数最终被调用时触发。若在 rejected 被创建后直接将拒绝处理函数附加到它上面，那么此事件就不会被触发。因为立即附加的拒绝处理函数在 rejected 被创建的事件循环的同一个轮次内就会被调用，这样 rejectionHandled 就不会起作用。为了正确追踪潜在的未被处理的拒绝，使用 rejectionHandled 与 unhandledRejection 事件就能保持包含这些 Promise 的一个列表，之后等待一段时间再检查此列表。例如：
```Js
let possiblyUnhandledRejections = new Map();
// 当一个拒绝未被处理，将其添加到 map
process.on("unhandledRejection", function(reason, promise) {
    possiblyUnhandledRejections.set(promise, reason)
})
process.on("rejectionHandled", function(promise) {
    possiblyUnhandledRejections.delete(promise)
})
setInterval(function() {
    possiblyUnhandledRejections.forEach(function(reason, promise) {
        console.log(reason.message ? reason.message : reason)
        // 做点事来处理这些拒绝
        handleRejection(promise, reason)
    })
    possiblyUnhandledRejections.clear()
}, 60000)
```
对于未处理的拒绝，这只是个简单追踪器。它使用了一个 Map 来储存 Promise 及其拒绝原因，每个 Promise 都是键，而它的拒绝原因就是相关的值。每当 unhandledRejection 被触发， Promise 及其拒绝原因就会被添加到此 Map 中。而每当 rejectionHandled 被触发，已被处理的 Promise 就会从这个 Map 中被移除。这样一来， possiblyUnhandledRejections 就会随着事件的调用而扩展或收缩。 setInterval() 的调用会定期检查这个列表，查看可能未被处理的拒绝，并将其信息输出到控制台（在现实情况下，你可能会想做点别的事情，以便记录或处理该拒绝）。此例使用了一个 Map 而不是 Weak Map ，这是因为你需要定期检查此Map 来查看哪些 Promise 存在，而这是使用 Weak Map 所无法做到的。尽管此例仅针对 Node.js ，但浏览器也实现了类似的机制来将未处理的拒绝通知给开发者。
### 浏览器的拒绝处理
浏览器同样能触发两个事件，来帮助识别未处理的拒绝。这两个事件会被 window 对象触发，并完全等效于 Node.js 的相关事件：
unhandledrejection ：当一个 Promise 被拒绝、而在事件循环的一个轮次中没有任何拒绝处理函数被调用，该事件就会被触发；
rejectionHandled ：若一个 Promise 被拒绝、并在事件循环的一个轮次之后再有拒绝处理函数被调用，该事件就会被触发。
Node.js 的实现会传递分离的参数给事件处理函数，而浏览器事件的处理函数则只会接收到包含下列属性的一个对象：
type ： 事件的名称（ "unhandledrejection" 或 "rejectionhandled" ）；
promise ：被拒绝的 Promise 对象；
reason ： Promise 中的拒绝值（拒绝原因）。
浏览器的实现中存在的另一个差异就是：拒绝值（ reason ）在两种事件中都可用。例如：
```Js
let rejected
window.onunhandledrejection = function(event) {
    console.log(event.type) // "unhandledrejection"
    console.log(event.reason.message) // "Explosion!"
    console.log(rejected === event.promise) // true
}
window.onrejectionhandled = function(event) {
    console.log(event.type) // "rejectionhandled"
    console.log(event.reason.message) // "Explosion!"
    console.log(rejected === event.promise) // true
}
```
rejected = Promise.reject(new Error("Explosion!"));
此代码使用了 DOM 0 级写法的 onunhandledrejection 与 onrejectionhandled ，对两个事件处理函数都进行了赋值（若你喜欢，也可以使用 addEventListener("unhandledrejection") 与addEventListener("rejectionhandled") ）。每个事件处理函数都接收一个事件对象，其中包含与被拒绝的 Promise 有关的信息， type 、 promise 与 reason 属性都可用。以下代码在浏览器中追踪未被处理的拒绝，与 Node.js 的代码非常相似：
```Js
let possiblyUnhandledRejections = new Map()
// 当一个拒绝未被处理，将其添加到 map
window.onunhandledrejection = function(event) {
    possiblyUnhandledRejections.set(event.promise, event.reason);
}
window.onrejectionhandled = function(event) {
    possiblyUnhandledRejections.delete(event.promise)
}
setInterval(function() {
    possiblyUnhandledRejections.forEach(function(reason, promise) {
        console.log(reason.message ? reason.message : reason)
        // 做点事来处理这些拒绝
        handleRejection(promise, reason)
    })
    possiblyUnhandledRejections.clear()
}, 60000)
```
这个实现与 Node.js 的实现几乎一模一样。使用了相同方法在 Map 中存储 Promise 及其拒绝值，并在此后进行检查。唯一真正的区别就是在事件处理函数中信息是从何处被提取出来
的。
处理 Promise 的拒绝可能很麻烦，但你才刚开始见识 Promise 实际上到底有多强大。现在是时候更进一步了——把几个 promises 串联在一起使用。

### 串联Promise
到此为止， Promise 貌似不过是个对组合使用回调函数与 setTimeout() 函数的增量改进，
然而 Promise 的内容远比表面上所看到的更多。更确切地说，存在多种方式来将 Promise 串
联在一起，以完成更复杂的异步行为。
**每次对 then() 或 catch() 的调用实际上创建并返回了另一个 Promise ，仅当前一个Promise 被完成或拒绝时，后一个 Promise 才会被决议。研究以下例子：**
```Js
let p1 = new Promise(function(resolve, reject) {
    resolve(42)
})

p1.then(function(value) {
    console.log(value)
}).then(function() {
    console.log('finished')
})
```
此代码输出：
42
finished
对 p1.then() 的调用返回了第二个 Promise ，又在这之上调用了 then() 。仅当第一个Promise 已被决议后，第二个 then() 的完成处理函数才会被调用。假若你在此例中不使用
串联，它看起来就会是这样：
```Js
let p1 = new Promise(function(resolve, reject) {
    resolve(42)
})
let p2 = p1.then(function(value) {
    console.log(value)
})
p2.then(function() {
    console.log("Finished")
})
```
在这个无串联版本的代码中， p1.then() 的结果被存储在 p2 中，并且随后 p2.then() 被调用，以添加最终的完成处理函数。正如你可能已经猜到的，对于 p2.then() 的调用也返回了一个 Promise ，本例只是未使用此 Promise 。

#### 捕获错误
Promise链允许捕获前一个Promise的完成或拒绝处理函数中发生的错误。
```Js
let p1 = new Promise(function(resolve, reject) {
    resolve(42)
})

p1.then(function(value) {
    throw new Error('boom' + value)
}).catch(function(error) {
    console.log(error.message)  //boom42
})
```
此代码中，p1的完成处理函数抛出了一个错误，链式调用指向了第二个Promise上的catch()方法，能通过此拒绝处理函数接受前面的错误。若是一个拒绝处理函数抛出了错误，情况也一样
```Js
let p1 = new Promise(function(resolve, reject) {
    throw newError('Explosion')
})
p1.catch(function(error) {
    console.log(error.message)  //Explosion
    throw new Error('boom')
}).catch(function(error) (
    console.log(error.message)   //boom
))
```
此处的执行器抛出了一个错误，就触发了 p1 这个 Promise 的拒绝处理函数，该处理函数随后抛出了另一个错误，并被第二个 Promise 的拒绝处理函数所捕获。链式 Promise 调用能察觉到链中其他 Promise 中的错误。
为了确保能正确处理任意可能发生的错误，应当始终在 Promise 链尾部添加拒绝处理函数。

#### 在Promise链中返回值
Promise链的另一种药方面是能从一个Promise传递数据给下一个Promise的能力。传递给执行器中的resolve()处理函数的参数，会被传递给对应Promise的完成处理函数：
```Js
let p1 = new Promise(function(resolve, reject) {
    resolve(42)
})
p1.then(function(value) {
    console.log(value)      //42
    return value + 1
}).then(function(value) {
    console.log(value)      //43
})
```
p1 的完成处理函数在被执行时返回了 value + 1 。由于 value 的值为 42 （来自执行器），此完成处理函数就返回了 43 。这个值随后被传递给第二个 Promise 的完成处理函数，并被其输出到控制台。
可以对拒绝处理函数做相同的事。当一个拒绝处理函数被调用时，它也能返回一个值。如果这么做，该值会被用于完成下一个 Promise：
```Js
let p1 = new Promise(function(resolve, reject) {
    reject(42)
})
p1.catch(function(value) {
    // 第一个完成处理函数
    console.log(value) // "42"
    return value + 1
}).then(function(value) {
    // 第二个完成处理函数
    console.log(value) // "43"
})
```
此处的执行器使用 42 调用了 reject() ，该值被传递到这个 Promise 的拒绝处理函数中，从中又返回了 value + 1 。尽管后一个返回值是来自拒绝处理函数，它仍然被用于链中下一个Promise 的完成处理函数。若有必要，一个 Promise 的失败可以通过传递返回值来恢复整个Promise 链。

### 在Promise链中返回Promise
从完成或拒绝处理函数中返回一个基本类型值，能够在Promise之间传递数据，但若返回的是一个对象呢？若该对象是一个Promise，那么需要采取一个额外步骤来决定如何处理：
```Js
let p1 = new Promise(function(resolve, reject) {
    resolve(42)
})
let p2 = new Promsise(function(resolve, reject) {
    resolve(43)
})
p1.then(function(value) {
    // 第一个完成处理函数
    console.log(value)   //42
    return p2
}).then(function(value) {
    // 第二个完成处理函数
    console.log(value)   //43
})
```
在此代码中， p1 安排了一个决议 42 的作业， p1 的完成处理函数返回了一个已处于决议态的 Promise ： p2 。由于 p2 已被完成，第二个完成处理函数就被调用了。而若 p2 被拒绝，会调用拒绝处理函数（如果存在的话），而不调用第二个完成处理函数。
关于此模式需认识的首要重点是第二个完成处理函数并未被添加到 p2 上，而是被添加到第三个 Promise 。正因为此，上个例子就等价于：
```Js
let p1 = new Promise(function(resolve, reject) {
    resolve(42)
})
let p2 = new Promise(function(resolve, reject) {
    resolve(43)
})
let p3 = p1.then(function(value) {
    // 第一个完成处理函数
    console.log(value)   //42
    return p2
})
p3.then(function(value) {
    // 第二个完成处理函数
    console.log(value)   //43
})
```
此处清楚说明了第二个完成处理函数被附加给 p3 而不是 p2 。这是一个细微但重要的区
别，因为若 p2 被拒绝，则第二个完成处理函数就不会被调用。例如：
```Js
let p1 = new Promise(function(resolve, reject) {
    resolve(42)
})
let p2 = new Promise(function(resolve, reject) {
    reject(43)
})
p1.then(function(value) {
// 第一个完成处理函数
console.log(value) // 42
    return p2
}).then(function(value) {
// 第二个完成处理函数
    console.log(value) // 永不被调用
})
```
在此例中，由于 p2 被拒绝了，第二个完成处理函数就永不被调用。不过你可以改为对其附加一个拒绝处理函数：
```Js
let p1 = new Promise(function(resolve, reject) {
    resolve(42)
});
let p2 = new Promise(function(resolve, reject) {
    reject(43)
});
p1.then(function(value) {
    // 第一个完成处理函数
    console.log(value) // 42
    return p2
}).catch(function(value) {
    // 拒绝处理函数
    console.log(value) // 43
})

```
此处 p2 被拒绝，导致拒绝处理函数被调用，来自 p2 的拒绝值 43 会被传递给拒绝处理函数。从完成或拒绝处理函数中返回 thenable ，不会对 Promise 执行器何时被执行有所改变。第一个被定义的 Promise 将会首先运行它的执行器，接下来才轮到第二个 Promise 的执行器执行，以此类推。返回 thenable 只是让你能在 Promise 结果之外定义附加响应。你能通过在完成处理函数中创建一个新的 Promise ，来推迟完成处理函数的执行。例如：
```Js
let p1 = new Promise(function(resolve, reject) {
resolve(42)
})
p1.then(function(value) {
console.log(value) // 42
    // 创建一个新的 promise
    let p2 = new Promise(function(resolve, reject) {
        resolve(43)
    })
    return p2
}).then(function(value) {
    console.log(value) // 43
})
```
在此例中，一个新的 Promise 在 p1 的完成处理函数中被创建。这意味着直到 p2 被完成之后，第二个完成处理函数才会执行。若你想等待前面的 Promise 被解决，之后才去触发另一个 Promise ，那么这种模式就非常有用。

### 响应多个Promise
至今的每个例子在同一时刻都只响应一个 Promise 。然而有时会想监视多个 Promise的进程，以便决定下一步行动。 ES6 提供了能监视多个 Promise 的两个方法：Promise.all() 与 Promise.race()。
#### Promise.all()方法
Promise.all()方法接收单个可迭代对象（如数组）作为参数，并返回一个Promise。这个可迭代对象的元素都是Promise，只有在它们都完成后，所返回的Promise才会被完成。例如：
```Js
let p1 = new Promise(function(resolve,reject) {
    resolve(42)
})
let p2 = new Promise(function(resolve, reject) {
    resolve(43)
})
let p3 = new Promise(function(resolve, reject) {
    resolve(44)
})
let p4 = Promise.all([p1, p2, p3])
p4.then(function(value) {
    console.log(Array.isArray(value))  //true
    console.log(value)
})
```
此处前面的每个Promise都用一个数值进行了决议，对Promise.all()的调用创建了新的Promise p4，在p1，p2和p3都被完成后，p4最终也会被完成。传递给p4的完成处理函数的结果是一个包含每个决议值（42，42，43）的数组，这些值得存储顺序保持了待决议的Promise的顺序（**与完成的先后顺序无关），因此可以将结果匹配到每个Promise。
若传递给Promise.all()的任意Promise被拒绝了，那么方法所返回的Promise就会立即被拒绝，而不必等待其他的Promise结束：
```Js
let p1 = new Promise(function(resolve, reject) {
    resolve(42)
})

let p2 = new Promise(function(resolve, reject) {
    reject(43)
})

let p3 = new Promise(function(resolve, reject) {
    resolve(44)
})

let p4 = Promise.all([p1, p2, p3])
p4.catch(function(value) {
    console.log(Array.isArray(value))   //false
    console.log(value)                  //43
})
```
在此例中，p2被使用数值43进行了拒绝，则p4的拒绝处理函数就立刻被调用，而不会等待p1或p3结束执行（它们任然会各自结束执行，只是p4不等它们）。
拒绝处理函数总会接收到单个值，而不是一个数组，该值就是被拒绝的Promise所返回的拒绝值。本例中的决绝处理函数被传入了43，反映了来自p2的拒绝。

#### Promise.race()方法
Promise.race()提供了监视多个Promise的一个稍微不同的方法。此方法也接受一个包含需要监视的Promise的可迭代对象，并返回一个新的Promise，但一旦来源Promise中有一个被解决，所返回的Promise就会立刻被解决。等待所有Promise完成的Promise.all()方法不同，来自源Promise中任意一个被完成时，Promise.race()方法所返回的Promise就能作出响应。
```Js
let p1 = Promise.resolve(42)
let p2 = new Promise(function(resolve, reject) {
    resolve(43)
})
let p3 = new Promise(function(resolve, reject) {
    resolve(44)
})
let p4 = Promise.race([p1, p2, p3])
p4.then(function(value) {
    console.log()     //42
})
```
在此代码中， p1 被创建为一个已完成的 Promise ，而其他的 Promise 则需要调度作业。p4 的完成处理函数被使用数值 42 进行了调用，并忽略了其他的 Promise 。传递给Promise.race() 的 Promise 确实在进行赛跑，看哪一个首先被解决。若胜出的 Promise 是被完成，则返回的新 Promise 也会被完成；而胜出的 Promise 若是被拒绝，则新 Promise 也会被拒绝。此处有个使用拒绝的范例：
```Js
let p1 = new Promise(function(resolve, reject) {
    resolve(42)
})
let p2 = Promise.reject(43)
let p3 = new Promise(function(resolve, reject) {
    resolve(44)
})
let p4 = Promise.race([p1, p2, p3])
p4.catch(function(value) {
    console.log(value); // 43
})
```
此处的 p4 被拒绝了，因为 p2 在 Promise.race() 被调用时已经处于拒绝态。尽管 p1 与p3 都被完成，其结果仍然被忽略，因为这发生在 p2 被拒绝之后。

### 继承Promise
正像其他内置类型，可将一个Promise用作派生类的基类。这允许你自定义变异的Promise，在内置Promise的基础上扩展功能，例如假设想创建一个可以使用succss()和failure()方法的Promise，对常规的then()和catch()方法进行扩展，可以像下面这样创建该Promise类型：
```Js
class MyPromise extends Promise {
    success(resolve, reject) {
        return this.then(resolve, reject)
    }

    failure(reject) {
        return this.catch(reject)
    }
}

let promise = new MyPromise(function(resolve, reject) {
    resolve(42)
})

promise.success(function(value) {
    console.log(value)
}).failure(function(value) {
    console.log(value)
})
```
在此例中， MyPromise 从 Promise 上派生出来，并拥有两个附加方法。 success() 方法模拟了 resolve() ， failure() 方法则模拟了 reject() 。
每个附加方法都使用了 this 来调用它所模拟的方法。派生的 Promise 函数与内置的Promise 几乎一样，除了可以随你需要调用 success() 与 failure() 。
由于静态方法被继承了， MyPromise.resolve() 方法、 MyPromise.reject() 方法、MyPromise.race() 方法与 MyPromise.all() 方法在派生的 Promise 上都可用。后两个方法的行为等同于内置的方法，但前两个方法则有轻微的不同。
MyPromise.resolve() 与 MyPromise.reject() 都会返回 MyPromise 的一个实例，无视传递进来的值的类型，这是由于这两个方法使用了 Symbol.species 属性（详见第九章）来决定需要返回的 Promise 的类型。若传递内置 Promise 给这两个方法，将会被决议或被拒绝，并且会返回一个新的 MyPromise ，以便绑定完成或拒绝处理函数。例如：

```Js
let p1 = new Promise(function(resolve, reject) {
    resolve(42)
})

let p2 = MyPromise.resolve(p1)
p2.MyPromise.resolve(p1)
p2.success(function(value) {
    console.log(value)  //42
})

console.log(p2 instanceof MyPromise)  //true
```
此处的p1是一个内置的Promise，被传递给了MyPromise.resolve()方法。作为结果的p2是MyPromise的一个实例，来自p1的决议值被传递给了p2的完成处理函数。
若MyPromise的一个实例被传递给了MyPromise.resolve()或MyPromise.reject()方法，它会在未被决议的情况下就被直接返回。其他情况下，这两个方法的行为都会等同于Promise.resolve()与Promise.reject()

### 异步任务运行
可以像如下方案进行异步任务运行：
```Js
let fs = require('fs')
function run(taskDef) {
    // 创建迭代器，让它在别处可用
    let task = taskDef()
    // 开始任务
    let result = task.next()
    // 递归使用函数来保持对next()的调用
    function step() {
        if(!result.done) {
            if(typeof result.value === 'function') {
                result.value(function(err, data) {
                    if (err) {
                        result = task.throw(err)
                        return
                    }

                    result = task.next(data)
                    step()
                })
            } else {
                result = task.next(result.value)
                step()
            }
        }
        console.log(result)
    }
    // 开始处理过程
    step()
}
// 定义一个函数来配合任务运行器使用
function readFile(filename) {
    return function(callback) {
        fs.readFile(filename, callback)
    }
}

run(function *() {
    let contents = yield readFile('config.json')
    doSomethingWith(contents)
    console.log('done')
})
```

此实现存在一些痛点。首先，将每个函数包裹在另一个函数内，再返回一个新函数，这是有点令人困惑的。其次，返回值为函数的情况下，没有任何方法可以区分它是否应当被作为任务运行器的回调函数。
借助Promise，可以确保每个异步操作都返回一个Promise，从而大幅度简化并一般化异步处理，通过接口也意味着可以大大减少异步代码。此处有一个简化异步任务运行器的方式:
```Js
let fs = require('fs')
function run(taskDef) {
    // 创建迭代器
    let task = taskDef()
    // 启动任务
    let result = task.next()
    // 递归使用函数来进行迭代
    (function step() {
        if (!result.done) {
            // 决议一个Promise，让任务处理变简单
            let promise = Promise.resolve(result.value)
            promise.then(function(value) {
                result = task.next(value)
                step()
            }).catch(function(error) {
                result = task.throw(error)
                step()
            })
        }
    }())
}

// 定义一个函数来配合任务运行器使用
function readFile(filename) {
    return new Promise(function(resolve, reject) {
        fs.readFile(filename, function(err, contents) {
            if (err) {
                reject(err)
            } else {
                resolve(contents)
            }
        })
    })
}
// 运行一个任务
run(function *() {
    let contents = yield readFile('config.json')
    doSomethingWith(contents)
    console.log('done')
})
```
在此版本的代码中，一个通用的 run() 函数执行了生成器来创建一个迭代器。它调用了task.next() 来启动任务，并递归调用 step() 直到迭代完成。
在 step() 函数内部，如果还有更多工作要做，那么 result.done 的值会是 false ，此时result.value 应当是一个 Promise ，不过调用 Promise.resolve() 只为预防未正确返回Promise 的函数（记住： Promise.resolve() 在被传入任意 Promise 时只会直接将其传递回来，而不是 Promise 的参数则会被包装为 Promise ）。接下来，一个完成处理函数被添加以便提取该 Promise 值，并将该值传回迭代器。此后，在 step() 函数调用自身之前，result 被赋值为下一个 yield 的结果。
一个拒绝处理函数将任意拒绝结果存储在一个错误对象中。 task.throw() 方法将这个错误对象传回给迭代器，而若一个错误在任务中被捕获， result 也会被赋值为下一个 yield 的结果，这样 step() 最终在 catch() 内部就会被调用，以便继续任务执行。run() 函数能运行任意使用 yield 来实现异步代码的生成器，而不会将 Promise （或回调函数）暴露给开发者。事实上，由于函数调用后的返回值总是会被转换为一个 Promise ，该函数甚至允许返回 Promise 之外的类型。这意味着同步与异步方法在使用 yield 时都会正常工作，并且你永不需要检查返回值是否为一个 Promise 。唯一需要担心的是，要确保诸如 readFile() 的异步方法能返回一个正确标记其状态的Promise 。对于 Node.js 内置的方法来说，这意味着你必须转换这些方法，让它们返回Promise 而不是使用回调函数。
未来的异步任务运行
在我写这本书的时候，针对 JS 中的异步任务运行，为之引入简单语法的一项工作正在进行。此工作开展在 await 语法上，极度借鉴了上述以 Promise 为基础的例子。其基本理念是使用一个被 async 标记的函数（而非生成器），并在调用另一个函数时使用await 而非 yield ，就像这样：
```Js
(async function() {
let contents = await readFile("config.json");
doSomethingWith(contents)
    console.log("Done")
})
```
在 function 之前的 async 关键字标明了此函数使用异步方式运行。 await 关键字则表示对于 readFile("config.json") 的函数调用应返回一个 Promise ，若返回类型不对，则会将其包装为 Promise 。与上述 run() 的实现一致， await 会在 Promise 被拒绝的情况下抛出错误，否则它将返回该 Promise 被决议的值。最终结果是你可以将异步代码当作同步代码来书写，而无须为管理基于迭代器的状态机而付出额外开销。