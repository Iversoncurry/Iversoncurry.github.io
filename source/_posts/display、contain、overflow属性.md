---
title: display属性 contain属性 overflow属性
date: 2020-04-27 23:18:39
tags: CSS
---
# display属性
display 属性可以设置元素的内部和外部显示类型 display types。元素的外部显示类型 outer display types 将决定该元素在流式布局中的表现（块级或内联元素）；元素的内部显示类型 inner display types 可以控制其子元素的布局（例如：flow layout，grid 或 flex）。

display 属性使用关键字取值来指定，关键字取值被分为六类：

```js
[ <display-outside> || <display-inside> ] | <display-listitem> | <display-internal> | <display-box> | <display-legacy>
where 
<display-outside> = block | inline | run-in
<display-inside> = flow | flow-root | table | flex | grid | ruby
<display-listitem> = <display-outside>? && [ flow | flow-root ]? && list-item
<display-internal> = table-row-group | table-header-group | table-footer-group | table-row | table-cell | table-column-group | table-column | table-caption | ruby-base | ruby-text | ruby-base-container | ruby-text-container
<display-box> = contents | none
<display-legacy> = inline-block | inline-list-item | inline-table | inline-flex | inline-grid
```

**Outside**
<display-outside>
这些关键字指定了元素的外部显示类型，实际上就是其在流式布局中的角色（即在流式布局中的表现），（块元素行内元素）。

**Inside**
<display-inside> (flex)
这些关键字指定了元素的内部显示类型，它们定义了该元素内部内容的布局方式（假定该元素为非替换元素 non-replaced element）。

# contain属性
contain 属性允许开发者声明当前元素和它的内容尽可能的独立于 DOM 树的其他部分。这使得浏览器在重新计算布局、样式、绘图或它们的组合的时候，只会影响到有限的 DOM 区域，而不是整个页面。

## 属性值
none
声明元素正常渲染，没有包含规则。
strict
声明所有的包含规则应用于这个元素。这样写等价于 contain: size layout style paint。
content
声明这个元素上有除了 size 外的所有包含规则。等价于 contain: layout style paint。
size
声明这个元素的尺寸计算不依赖于它的子孙元素的尺寸。
layout
声明没有外部元素可以影响它内部的布局，反之亦然。
style
声明那些同时会影响这个元素和其子孙元素的属性，都在这个元素的包含范围内。
paint
声明这个元素的子孙节点不会在它边缘外显示。如果一个元素在视窗外或因其他原因导致不可见，则同样保证它的子孙节点不会被显示。

# overflow
CSS属性 overflow 定义当一个元素的内容太大而无法适应 块级格式化上下文 时候该做什么。它是 overflow-x 和overflow-y的 简写属性 。

## 属性值
visible
默认值。内容不会被修剪，可以呈现在元素框之外。
hidden
如果需要，内容将被剪裁以适合填充框。 不提供滚动条。
scroll
如果需要，内容将被剪裁以适合填充框。 浏览器显示滚动条，无论是否实际剪切了任何内容。 （这可以防止滚动条在内容更改时出现或消失。）打印机仍可能打印溢出的内容。
auto
取决于用户代理。 如果内容适合填充框内部，则它看起来与可见内容相同，但仍会建立新的块格式化上下文。 如果内容溢出，桌面浏览器会提供滚动条。