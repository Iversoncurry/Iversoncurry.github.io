---
title: JS的类
date: 2020-02-20 20:27:08
tags: JavaScript
---
与大多数正规的面向对象编程语言不同，JS从创建之初就不支持类，也没有把类继承作为定义相似对象以及关联对象的主要方式。而从ES1诞生之前知道ES5时期，很多库都创建了一些工具，让JS显得貌似能支持类。
### ES5中仿类结构
JS在ES5以及更早版本中都不存在类。与类最接近的是：创建一个构造器，然后将方法指派到该构造起的原型上。这种方式通常被称为创建一个自定义类型。例如：
```Js
function PersonType(name) {
    this.name = name
}

PersonType.prototype.sayName = function() {
    console.log(this.name)
}

let person = new PersonType('Nicholas')
person.sayName()  //Nicholas

console.log(person instanceof PersonType)  //true
console.log(person instanceof Object)      //true
```
此代码中的 PersonType 是一个构造器函数，并创建了单个属性 name 。 sayName() 方法被指派到原型上，因此在 PersonType 对象的所有实例上都共享了此方法。接下来，使用 new运算符创建了 PersonType 的一个新实例 person ，此对象会被认为是一个通过原型继承了PersonType 与 Object 的实例。

### 类的声明
类在ES6中最简单的形式就是类声明，看起来向其他语言中的类

#### 基本的类声明
类声明以class关键字开始，其后是类的名称；其余部分的语法看起来就像对象字面量中的方法简写，并且在方法之间不需要使用逗号。下为简单类声明：
```Js
class PersonCladd {
    // 等价于PersonType构造器
    constructor(name) {
        this.name = name
    }
    // 等价于PersonType.prototype.sayName
    sayName() {
        console.log(this.name)
    }
}

let person = new PersonClass('Nicholas')
person.sayName()   //输出Nicholas

console.log(person instanceof PersonClass)  //true
console.log(person instanceof Object)    //true

console.log(typeof PersonClass)     //function
console.log(typeof PersonClass.prototype.sayName)  //function
```
这个PersonClass类声明的行为非常类似上个例子中的PersonType。类声明允许在其中使用特殊的constructor方法名称直接定义一个构造器，而不需要先定义一个函数再把它当做构造器使用。由于累的方法使用类间歇语法，于是就不再需要使用function关键字。constructor之外的方法名称则没有特别的含义。
自有属性（Own properties）：该属性出现在实力上而不是原型上，只能在类的构造器或方法内部进行创建。在本例中，name就是一个自有属性。建议应在构造器函数内创建所有可能出现的自有属性，这样在类中声明变量就会被限制在单一位置（有助于代码检查）
相对于已有的**自定义类型声明方式**来说，**类声明**仅仅是以它为基础的一个语法糖。PersonClass声明实际上创建了一个拥有constructor方法以及其行为的函数，这也是typeof PersonClass会得到“function”结果的原因。此例中的sayName()方法最终也成为PersonClass.prorotype上的一个方法，类似于上个例子中的sayName()与PersonType。prototype之间的关系。这些相似处允许把自定义类型与类混合使用，而不必考虑该使用哪一个。

#### 为何要使用类的语法
尽管类与自定义类型之间有相似性，但仍然要记住一些重要的区别：
1.类声明不会被提升，这与函数定义不同。类声明的行为与let相似，因此在程序执行到达声明处之前，类会存在于暂时性死区内。
2.类声明中的所有代码会自动运行在严格模式下，并且也无法退出严格模式。
3.类的所有方法都是不可枚举的，这是对于自定义类型的显著变化，后者必须用Object.defineProperty()才能将方法改变为不可枚举。
4.类的所有方法内部都没有[[Construct]]，因此使用new来调用它们会抛出错误。
5.调用类构造器时不使用new，会抛出错误。
6.试图在类的方法内部重写类名，会抛出错误。
这样看来，上例中的PersonClass声明实际上就直接等价于一下未使用类语法的代码：
```Js
//直接等价于PersonClass
let PersonType2 = (function() {
    "use strict"
    const PersonType = function(name) {
        // 确认函数被调用时使用了new
        if(typeof new.target === 'undefined') {
            throw new Error('constructor must be called with new')
        }
        this.name = name
    }
    Object.defineProperty(PersonType2.prototype, 'sayName', {
        value: function() {
            // 确认函数被调用时没有使用new
            if (typeof new.target !== 'undefined') {
                throw new Error('method cannot be called with new')
            }
            console.log(this.name)
        },
        enumerable: false,
        writable: true,
        configurable: true
    }) 
    return PersonType2
}())
```
首先要注意这里有两个PersonType2声明：一个在外部作用的let声明，一个在IIFE内部的const声明。这就是为何类的方法不能对类名进行重写、而类外部的代码则被允许。构造器函数检查了new.target，以保证被调用时使用了new，否则就抛出错误。接下来，sayName()方法被定义为不可枚举，并且此方法也检查了new.target，它则要保证在被调用时没有使用new。最后一步是将构造器函数返回出去。
此例说明了尽管不使用新语法也能实现类的任何特性，但类语法显著简化了所有功能的代码。
不变的类名
只有在类的内部，类名才被视为是使用const声明的。这意味着你可以在外部重写类名但不能再累的方法内部这么做。例如：
```Js
class Foo {
    constructor() {
        Foo = 'bar' //执行时抛出错误
    }
}
// 但在类声明之后没问题
Foo = 'baz'
```

在此代码中，类构造器内部的 Foo 与在类外部的 Foo 是不同的绑定。内部的 Foo 就像是用 const 定义的，不能被重写，当构造器尝试使用任何值重写 Foo 时，都会抛出错误。但由于外部的 Foo 就像是用 let 声明的，你可以随时重写类名。

### 类表达式
类与函数有相似之处，即它们都有两种形式：声明与表达式。函数声明与类声明都以适当的关键词为起始分别是（function与class），随后是标识符（即函数名或类名）。函数具有一种表达式形式，无需在function后面使用表示；类似的，类也有不需要表示符的表达式形式。类表达式被设计用于变量声明，或可作为参数传递给函数。
基本的类表达式
此处是与上例中的PersonCladd等效的类表达式，随后的代码使用了它：
```Js
let PersonClass = class {
    // 等价于PersonType构造器
    constructor(name) {
        this.name = name
    }

    // 等价于PersonType.prototype.sayName
    sayName() {
        console.log(this.name)
    }
}
let person = new PersonClass('nicholas')
person.sayName()  //输出nicholas
console.log(person instanceof PersonClass)   //true
console.log(person instanceof Object)        //true
console.log(typeof PersonClass)              //function
console.log(typeof PersonClass.prototype.sayName) //function
```
正如磁力所示，类表达式不需要再class关键字后使用标识符。除了语法差异，类表达式的功能等价于类声明。
使用类声明还是类表达式，主要是代码风格的问题。相对于函数声明与函数表达式之间的区别，类声明与类表达式都不会被提升，因此对代码运行时的行为影响甚微。
#### 具名类表达式
上一节的示例使用了一个匿名的类表达式，不过就像函数表达式那样，也可以为类表达式明明。为此需要在class关键字后添加标识符，就像这样：
```Js
let PersonClass = calss PersonClass2 {
    // 等价于PersonType构造器
    constructor(name) {
        this.name = name
    }

    // 等价于PersonType.prototype.sayName
    sayName() {
        console.log(this.name)
    }
}
console.log(typeof PersonClass)   //function
console.log(typeof PersonClass2)  //undefined
```
此例中的类表达式被命名为PersonClass2。PersonClass2标识符只在类定义内部存在，因此只能用在类方法内部（例如本例中的sayName()内）。在类的外部，typeof PersonClass2的结果为undefined，这是因为外部不存在PersonClass2绑定。要理解为何如此，请查看未使用类语法的等价声明：
```Js
// 直接等价于PersonClass具名的类表达式
let PersonClass = (function() {
    'use strict'
    const = PersonClass2 = function(name) {
        // 确认函数被调用时使用了new
        if (typeof new.target === 'undefined') {
            throw new Error('constructor must be called with new')
        }
        this.name = name
    }
    object.defineProperty(PersonClass2.prototype, 'sayName', {
        value: function() {
            // 确认函数被调用时没有使用new
            if (typeof new.target !== 'undefined') {
                throw new Error('method cannot be called with new')
            }
            console.log(this.name)
        },
        enumerable: false,
        writable: true,
        configurable: true
    })
    return PersonClass2
}())
```
创建具名的类表达式稍微改变了在JS引擎内部发生的事。对于类声明来说，外部绑定（用let定义）与内部绑定（用const定义）有着相同的名称。而类表达式可在内部使用const来定义它的不同名称，因此此处的PersonClass2只能在类的内部使用。
尽管具名类表达式的行为已于具名函数表达式，但它们之间仍有许多相似点。二者都能被当做值来使用，这开启了许多可能性。
### 作为一级公民的类
在编程中，能被当做值来使用的就称为一级公民（first-class citizen），意味着它能作为参数给函数、能作为函数返回值、能用来给变量赋值。JS的函数就是一级公民（它们有时又被称为一级函数），此特性让JS独一无二。
ES6延续了传统，让类同样成为一级公民。这就使得类可以被多种方式所使用。例如，它能作为参数传入函数：
```Js
function crateObject(classDef) {
    return new classDef()
}
let obj = createObject(class {
    sayHi() {
        console.log('hi')
    }
})
obj.sayHi()      //hi
```
此例中的createObject()函数被调用时接收了一个匿名函数表达式作为参数，使用new创建了该类的一个实例，并将其返回出来。随后变量obj储存了所返回的实例。
类表达式的另一个又去用途是立即调用类构造器，以创建单例（Singleton）。为此，必须使用new来配合类表达式，并在表达式后面添加括号。例如：
```Js
let person = new class {
    constructor(name) {
        this.name = name
    }
    sayName() {
        console.log(this.name)
    }
}('nicholas')
person.sayName()   //nicholas
```
此处创建了一个匿名类表达式，并立即执行了它。此模式允许你使用类语法来创建单例类，从而不留下任何可被探查的类引用（回忆一下PersonClass的例子，匿名类表达式只在类的内部创建了绑定，而外部无绑定）。**类表达式后面的圆括号表示要调用前面的函数，并且还允许传入参数。**
### 访问器属性
自有属性需要在类构造器中创建，而类还允许在原型上定义访问器属性。为了创建一个getter，需要使用get关键字，并要与后方标识符之间留出空格；创建setter用相同方式，只是要换用set关键字。例如：
```Js
class CustomHTMLElement {
    constructor(element) {
        this.element = element
    }
    get html() {
        return this.element.innerHTML
    }
    set html(value) {
        this.element.innerHTML = value
    }
}
var descriptor = Object.getOwnPropertyDescriptor(CustomHTMLElement.prototype, 'html')
console.log('get' in descriptor)  //true
console.log('set' in descriptor)  //true
console.log(descriptor,enumerable) //false
```
此代码中的CustomHTMLElement类用于包装一个已存在的DOM元素，它的属性html拥有getter与setter，委托了元素自身的innerHTML方法。该访问器属性被创建在CUnstmHTMLElement.prototype上，并且像其他类属性那样被创建为不可枚举属性。非类的等价表示如下：
```Js
// 直接等价于上个范例
let CustomHTMLElement = (function() {
    'use strict'
    const CustomHTMLElement = function(element) {
        // 确认函数被调用时使用了new
        if (typeof new.target === 'undefined') {
            throw new Error('constructor must be called with new')
        }
        this.element = element
    }
    Object.defineProperty(CustomHTMLElement.prototype, 'html', {
        enumerable: false,
        configurable: true,
        get: function() {
            return this.element.innerHTML
        },
        set: function(value) {
            this.element.innerHTML = value
        }
    })
    return CunstomHTMLElement
}())
```
### 需计算的成员名
对象字面量与类之间的相似点还不仅前面那些。类方法与访问器属性也都能使用需计算的名称。㞏相同于对象字面量中的需计算名称：无需使用标识符，而是用方括号来包裹一个表达式。例如：
```Js
let methodName = 'sayName'
class = PersonClass {
    constructor(name) {
        this.name = name
    }
    [methodName]() {
        console.log(this.name)
    }
}
let me = new PersonClass('nicholas')
me.sayName()                  //'nicholas'
```
此版本的PersonClass使用了一个变量来命名类定义内的方法。字符串”sayName“被赋值给了methodName变量，而methodName变量则被用于声明方法。sayName()方法在此后能被直接访问。
访问器属性能以相同方式使用需计算的名称，就像这样：
```Js
let propertyName = 'html'
class CustomHTMLElement {
    constructor(element) {
        this.element = element
    }

    get [propertyName]() {
        return this.element.innerHTML
    }

    set [propertyName](value) {
        this.element.innerHTML = value
    }
}
```
此处html的getter与setter被设置为需使用propertyName变量，使用.html依然能访问此属性，这里影响的只有定义方式。
### 生成器方法
```Js
class MyClass {
    *createIterator() {
        yield 1
        yield 2
        yield 3
    }
}
let instance = new Myclass()
let iterator = instance.createIterator()
```
此处代码创建了一个拥有createIterator()生成器的MyClass类。该方法返回了一个迭代器，它的值在生成器内部用硬编码提供。当使用一个对象来表示值的集合、并要求能简单迭代这些值，那么生成器方法就非常有用。数组、Set与Map都拥有多个生成器方法，负责让开发者用多种方式来操作它们的项。
既然生成器方法很有用，那么在表示集合的自定义类中定义一个默认迭代器，那就更好。可以使用 Symbol.iterator 来定义生成器方法，从而定义出类的默认迭代器，就像这样：
```Js
class Collection {
    constructor() {
        this.item = []
    }
    *[Symbol.iterator]() {
        yield *this.items.values()
    }
}
var collection = new Collection()
collection.items.push(1)
collection.items.push(2)
collection.items.push(3)
for (let x of collection) {
    console.log(x)
}
```
此例为生成器方法使用了一个需计算名称，并将此方法委托到this.items数组的values()迭代器上。任意管理集合的类都包含一个默认迭代器，这是因为一些集合专用的操作都要求目标集合具有迭代器。现在，Collection的任意实例都可以在for-of循环内被直接使用，也能配合扩展运算符使用。
当你想让方法与访问器属性在对象实例上出现时，把它们添加到类的原型上就会对此目的有帮助。而另一方面，若想让方法与访问器属性只存在于类自身，那么你就需要使用静态成员。

#### 静态成员
直接在构造器上添加额外方法来模拟静态成员，这在ES5及更早版本中是另一个通用的模式。例如：
```Js
function PersonType(name) {
    this.name = name
}
// 静态方法
PersonType.create = function(name) {
    return new PersonType(name)
}
// 实例方法
PersonType.prototype.sayName = function() {
    console.log(this.name)
}
var person = PersonType.create('nicholas')
```
在其他编程语言中，工厂方法PersonType.create()会被认定为一个静态方法，它的数据不依赖PersonType的任何势力。ES6的类简化了静态成员的创建，只要在方法与访问器属性的名称前添加正式的static标注。作为一个例子，此处有个与上例等价的类：
```Js
class PersonClass {
    // 等价于PersonType构造器
    constructor(name) {
        this.name = name
    }
    // 等价于PersonType.prototype.sayName
    sayName() {
        console.log(this.name)
    }
    // 等价于PersonType.create
    static create(name) {
        return new PersonClass(name)
    }
}
let person = PersonClass.create('nicholas')
```
PersonClass 的定义拥有名为 create() 的单个静态方法，此语法与 sayName() 基本相同，只多了一个 static 关键字。你能在类中的任何方法与访问器属性上使用 static 关键字，唯一限制是不能将它用于 constructor 方法的定义。
**静态成员不能用实例来访问，始终需要直接用类自身来访问它们**

### 使用派生类进行继承
ES6之前，实现自定义类型的继承是个繁琐的过程。严格的继承要求有多个步骤。例如，研究一下范例：
```Js
function Rectangle(length, width) {
    this.length = length
    this.width = width
}
Rectangle.prototype.getArea = function() {
    return this.length*this.width
}
function Square(length) {
    Rectangle.call(this, length, length)
}
Square.prototype = Object.create(Rectangle.prototype, {
    constructor: {
        value: Square,
        enumerable: true,
        writable: true,
        configurable: true
    }
})

var square = new Square(3)
console.log(square.getArea())    //9
console.log(square instanceof Square)  //true
console.log(square instanceof Rectangle)  //true
```
Square继承了Rectangle，为此它必须使用Rectangle.prototype所创建的一个新对象来重写Square.prototype，并且还要调用Rectangle.call()方法。
类让继承工作变得更轻易，使用熟悉的extends关键字来指定当给钱类所需要的继承的函数即可。生成的类的原型会被自动调整，而你还能调用super()方法来访问基类的构造器。此处是与上个例子等价的ES6代码：
```Js
class Rectangle {
    constructor(length, width) {
        this.length = length
        this.width = width
    }
    getArea() {
        return this.length * this.width
    }
}
class Square extends Rectangle {
    constructor(length) {
        // 与Rectangle.call(this, length, length)相同
        super(length, length)
    }
}
var square = Square(3)
console.log(square.getArea)       //9
console.log(square instanceof Square)   //true
console.log(square instanceof Rectangle)  //true
```
此次Square类使用了extends关键字继承了Rectangle。Square构造器使用了super()配合指定参数调用了Rectangle构造器。注意与ES5版本的代码不同，Rectangle标识符尽在类定义时被使用了（在extends之后）。
继承了其他类的类被称为派生类（derived classes）。如果派生类指定了构造器，就需要使用super(),否则就会造成错误。若不使用构造器，super()方法会被自动调用，并会使用创建新实例时提供的所有参数。例如，下列两个类是完全相同的：
```Js
class Square extends Rectangle {
    // 没有构造器
}
// 等价于：
class Square extends Rectangle {
    constructor(...args) {
        super(...args)
    }
}
```
此例中的第二个类展示了与所有派生类默认构造器等价的写法，所有的参数都按顺序传递给了基类的构造器。在当前需求下，郑重做法并不完全准确，因为Square构造器只需要单个参数，因此最好手动定义构造器。
使用 super() 时需牢记以下几点：
1. 你只能在派生类中使用 super() 。若尝试在非派生的类（即：没有使用 extends关键字的类）或函数中使用它，就会抛出错误。
2. 在构造器中，你必须在访问 this 之前调用 super() 。由于 super() 负责初始化this ，因此试图先访问 this 自然就会造成错误。
3. 唯一能避免调用 super() 的办法，是从类构造器中返回一个对象。
```Js
class People {
	constructor(name, age) {
		this.name = name
		this.age = age
	}
	sayAge() {
		console.log(this.age)
	}
}

class Student extends People {
	constructor(name, age, classNum) {
		super(name, age)  //注释之后报错，没有this
		this.classNum = classNum
	}
}

let xiaoHong = new Student('xiaohong', '12', 'class3')
xiaoHong.sayAge()
```

#### 屏蔽类方法
派生类中的方法总是会屏蔽基类的同名方法。例如，可以将getArea()方法添加到Super类，以便重定义它的功能：
```Js
class Square extends Rectangle {
    constructor(length) {
        super(length, length)
    }
    getArea() {
        return this.length * this.length
    }
}
```
由于getArea()已经被定义为Square的一部分，Rectangle.prototype.getArea()方法就不能再Square的任何实例上被调用。当然，总可以使用super.getArea()方法来调用基类中的同名方法：
```Js
class Square extends Rectangle {
    constructor(length) {
        super(length, length)
    }
    getArea() {
        return super.getArea()
    }
}
```

#### 继承静态成员
如果基类包含静态成员，那么这些静态成员在派生类中也是可用的。继承的工作方式类似于其他语言。
```Js
class Rectangle {
    constructor(length, width) {
        this.length = length
        this.width = width
    }
    getArea() {
        return this.length * this.width
    }
    static create(length, width) {
        return new Rectangle(length, width)
    }
}
class Square extends Rectangle {
    constructor(length) {
        // 与Rectangle.call(this, length, length)相同
        super(length, length)
    }
}
var rect = Square.create(3, 4)   
console.log(rect instanceof Rectangle)  //true
console.log(rect.getArea())             //12
console.log(rect instanceof Square)     //false
```
在此代码中，一个新的静态方法 create() 被添加到 Rectangle 类中。通过继承，该方法会以 Square.create() 的形式存在，并且其行为方式与 Rectangle.create() 一样。

#### 从表达式中派生类
在ES6中派生类的最强大能力，或许就是能够从表达式中派生类。只要一个表达式能够返回一个具有[[Construct]]属性以及原型的函数，就可以对其使用extends。例如：
```Js
function Rectangle(length, width) {
    this.length = length
    this.width = width
}
Rectangle.prototype.getArea = function() {
    return this.length * this.width
}

class Square extends Rectangle {
    constructor(length) {
        super(length, length)
    }
}
var x = new Square(3)
console.log(x.getArea())             //9
console.log(x instanceof Rectangle)  //true
```
Rectangle被定义为ES5风格的构造器，而Square则是一个类。由于Rectangle具有[[Construct]]以及原型，Square类就能直接继承它。
extends后面能接受任意类型的表达式，这带来了巨大可能性，例如动态地决定所要继承的类：
```Js
function Rectangle(length, width) {
    this.length = length
    this.width = width
}
Rectangle.prototype.getArea = function() {
    return this.length * this.width
}
function getBase() {
    return Rectangle
}

class Square extends getBase() {
    constructor(length) {
        super(length, length)
    }
}
var x = new Square(3)
console.log(x.getArea())   //9
console.log(x instanceof Rectangle)  //true
```
getBase()函数作为类声明的一部分被直接调用，它返回了Rectangle，是的此例的功能等价于前一个例子。并且由于可以动态地决定基类，就能创建不同的继承方式。例如可以有效地创建混入：
```Js
let SerializableMixin = {
    serialize() {
        return JSON.stringify(this)
    }
}
let AreaMixin = {
    getArea() {
        return this.length * this.width
    }
}
function mixin(...mixins) {
    var base = function() {}
    Object.assign(base.prototype, ...mixins)
    return base
}
class Square extends mixin(AreaMixin, SerializableMixin) {
    constructor(length) {
        super()
        this.length = length
        this.width = width
    }
}
var x = new Square(3)
console.log(x.getArea())
console.log(x.serialize())  //{length: 3, width: 3}
```
此例使用了混入（mixin）而不是传统继承。mixin()函数接受代表混入对象的任意数量的参数，它创建了一个名为base的函数，并将每个混入对象的属性都赋值到新函数的原型上。阐述随后返回，于是Square就能够对其使用extends关键字了。注意由于仍然使用了extends，就必须在构造器内调用super().
Square的实例既有来自AreaMixin的getArea()方法，又有来自SerilaizableMixin的serialize()方法，这是通过原型继承实现的。mixin()函数使用了混入对象的所有自有属性，动态地填充了新函数的原型（注意：若多个混入对象拥有相同的属性，则只有最后添加的属性会被保留）。
任意表达式都能在extends关键字后使用，但并非所有表达式的结果都是一个有效的类。特别的，下列表达式类型会导致错误：
null;
生成器函数
试图使用结果为上述值得表达式来创建一个新的类实例，都会抛出错误，因为不存在[[Construct]]可供调用。
#### 继承内置对象
几乎从JS数组出现那天开始，开发者就像通过继承机制来创建它们自己的特殊数组类型。在ES5及早期版本中，这是不可能做到的。试图使用传统继承并不能产生功能正确的代码，例如：
```Js
// 内置数组的行为
var colors = []
colors[0] = 'red'
console.log(colors.length)
colors.length = 0
console.log(colors[0])  //undefined
// 在ES5中尝试继承数组
function MyArray() {
    Array.apply(this, arguments)
}
myArray.prototype = Object.create(Array.prototype, {
    constructor: {
        value: MyArray,
        writable: true,
        configurable: true,
        enumerable: true
    }
})
var colors = new MyArray()
colors[0] = 'red'
console.log(colors.length)  //0
colors.length = 0
console.log(colors[0])      //red
```
console.log()在此代码尾部的输出说明：对数组使用传统形式的JS继承，产生了预期外的行为。MyArray实例上的length属性以数值属性，其行为与内置数组并不一致，因为这些功能并未被涵盖在Array.apply()或数组原型中。
在ES6中的类，其设计目的之一就是允许从内置对象上进行继承。为了达成这个目的，类的继承模型与ES5或更早版本的传统继承模型有轻微差异：
在ES5的传统继承中，this的值会先被派生类（例如MyArray）创建，随后基类构造器（例如Array.apply()方法）才被调用。这意味着this一开始就是MyArray的实例，之后才使用了Array的附加属性对其进行了装饰。
在ES6基于类的继承中，this的值会先被基类（Array）创建，随后才被派生类的构造器（MyArray）所修改。结果是this初始就拥有作为基类的内置对象的所有功能，并能正确接收与之关联的所有功能。
一下范例实际展示了基于类的特殊数组：
```Js
class MyArray extends Array {
    // 空代码块
}
var colors = new MyArray()
colors[0] = 'red'
console.log(colors.length)    //1
colors.length = 0
console.log(colors[0])    //undefined
```
MyArray直接继承了Array，因此工作方式与正规数组一致。与数值索引属性额互动更新了length属性，而操纵length属性也能更新索引属性。这意味着既能适当地继承Array来创建自己的派生数组类，也同样能继承其他的内置对象。
#### Symbol.species属性
继承内置对象一个有趣的方面是：任意能返回内置对象实例的方法，在派生类的实例。因此，若拥有类一个继承了Array的派生类MyArray，注入slice()之类的方法都会返回MyArray的实例。例如：
```Js
class MyArray extends Array {
    // 空代码
}
let items = new MyArray(1, 2, 3, 4),
    subitems = items.slice(1, 3)
console.log(items instanceof MyArray)  //true
console.log(subitems instanceof MyArray)  //true
```
在此代码中，slice()方法返回了MyArray的一个实例。slice()方法是从Array上继承的，原本应当返回Array的一个实例。而Symbol.species属性在后台造成了这种变化。
Symbol.species是名符号被用于定义一个能返回函数的静态访问器属性。每当类实例的方法（构造器除外）必须常建一个实例时，前面返回的函数就被用为新实例的构造器。下列内置类型都定义了Symbol.species:
Array
ArrayBuffer
Map
Promise
RegExp
Set
类型化数组
以上每个类型都拥有默认的Symol.species属性，其返回值为this，意味着该属性总会返回自身的构造器函数。若准备在一个自定义类上实现此功能，代码就像这样：
```Js
// 几个内置类型使用species的方式类似于此
class MyClass {
    static get [Symbol.species]() {
        return this
    }
    constructor(value) {
        this.value = value
    }
    clone() {
        return new this.constructor[Symbol.species](this.value)
    }
}
```
再此例中，Symbol.species知名符号被用于定义MyClass的一个静态访问器属性。注意此处只有getter而没有setter，这是因为修改累的species是不允许的。任何对this.constructor[Symbol.species]的调用都会返回MyClass，clone()方法使用了该定义来返回一个新的实例，而没有直接使用MyClass，这就允许派生类重写这个值。
```Js
class MyClass {
    static get [Symbol.species]() {
        return this;
    }
    constructor(value) {
        this.value = value;
    }
    clone() {
        return new this.constructor[Symbol.species](this.value);
    }
}
class MyDerivedClass1 extends MyClass {
// 空代码块
}
class MyDerivedClass2 extends MyClass {
    static get [Symbol.species]() {
        return MyClass;
    }
}
let instance1 = new MyDerivedClass1("foo"),
clone1 = instance1.clone(),
instance2 = new MyDerivedClass2("bar"),
clone2 = instance2.clone();
console.log(clone1 instanceof MyClass); // true
console.log(clone1 instanceof MyDerivedClass1); // true
console.log(clone2 instanceof MyClass); // true
console.log(clone2 instanceof MyDerivedClass2); // false
```
此处, MyDerivedClass1 继承了 MyClass ，并且未修改 Symbol.species 属性。由于this.constructor[Symbol.species] 会返回 MyDerivedClass1 ，当 clone() 被调用时，它就返回了 MyDerivedClass1 的一个实例。 MyDerivedClass2 类也继承了 MyClass ，但重写了Symbol.species ，让其返回 MyClass 。当 clone() 在 MyDerivedClass2 的一个实例上被调用时，返回值就变成 MyClass 的一个实例。使用 Symbol.species ，任意派生类在调用应当返回实例的方法时，都可以判断出需要返回什么类型的值。
例如， Array 使用了 Symbol.species 来指定方法所使用的类，让其返回值为一个数组。在Array 派生出的类中，你可以决定这些继承的方法应返回何种类型的对象，正如：
```Js
class MyArray extends Array {
    static get [Symbol.species]() {
        return Array;
    }
}
let items = new MyArray(1, 2, 3, 4),
subitems = items.slice(1, 3);
console.log(items instanceof MyArray); // true
console.log(subitems instanceof Array); // true
console.log(subitems instanceof MyArray); // false
```
此代码重写了从 Array 派生的 MyArray 类上的 Symbol.species 。所有返回数组的继承方法现在都会使用 Array 的实例，而不是 MyArray 的实例。
一般而言，每当想在类方法中使用 this.constructor 时，你就应当设置类的Symbol.species 属性。这么做允许派生类轻易地重写方法的返回类型。此外，若你从一个拥有 Symbol.species 定义的类创建了派生类，要保证使用此属性，而不是直接使用构造器。

#### 在类构造器中使用new.target
在第三章你已学到了 new.target ，以及在调用函数的方式不同时它的值是如何变动的。你也可以在类构造器中使用 new.target ，来判断类是被如何被调用的。在简单情况下，new.target 就等于本类的构造器函数，正如下例；
```Js
class Rectangle {
    constructor(length, width) {
        console.log(new.target === Rectangle);
        this.length = length;
        this.width = width;
    }
}
// new.target 就是 Rectangle
var obj = new Rectangle(3, 4); // 输出 true
```
此代码说明在 new Rectangle(3, 4) 被调用时， new.target 就等于 Rectangle 。类构造器被调用时不能缺少 new ，因此 new.target 属性就始终会在类构造器内被定义。不过这个值并不总是相同的。研究以下代码：
```Js
class Rectangle {
    constructor(length, width) {
        console.log(new.target === Rectangle);
        this.length = length;
        this.width = width;
    }
}
class Square extends Rectangle {
    constructor(length) {
        super(length, length)
    }
}
// new.target 就是 Square
var obj = new Square(3); // 输出 false
```
Square 调用了 Rectangle 构造器，因此当 Rectangle 构造器被调用时， new.target 等于Square 。这很重要，因为构造器能根据如何被调用而有不同行为，并且这给了更改这种行为的能力。例如，你可以使用 new.target 来创建一个抽象基类（一种不能被实例化的类），如下：
```Js
// 静态的基类
class Shape {
    constructor() {
        if (new.target === Shape) {
            throw new Error("This class cannot be instantiated directly.")
        }
    }
}
class Rectangle extends Shape {
    constructor(length, width) {
        super();
        this.length = length;
        this.width = width;
    }
}
var x = new Shape(); // 抛出错误
var y = new Rectangle(3, 4); // 没有错误
console.log(y instanceof Shape); // true
```
此例中的 Shape 类构造器会在 new.target 为 Shape 的时候抛出错误，意味着 newShape() 永远都会抛出错误。然而，你依然可以将 Shape 用作一个基类，正如 Rectangle所做的那样。 super() 的调用执行了 Shape 构造器，而且 new.target 的值等于Rectangle ，因此该构造器能够无错误地继续执行。
由于调用类时不能缺少 new ，于是 new.target 属性在类构造器内部就绝不会是undefined 。