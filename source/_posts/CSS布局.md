---
title: CSS布局
tags: CSS
---
## 布局的基本概念
多栏布局有三种基本的实现方案：固定宽度、流动、弹性。
固定宽度布局的大小不会随用户调整浏览器窗口大小而变化（不适用）。
流动布局的大小会随用户调整浏览器窗口大小而变化。这种布局能更好的适应屏幕变化。但同时也意味着放弃对页面某些方面的控制，比如随着页面宽度变化，文本行的长度和页面元素之间的位置关系可能变化。
弹性布局与流动布局类似，在浏览器窗口变宽时，不仅布局变宽，而且所有内容元素的大小也会变化，让人产生一种所有东西都变大了的感觉。（很难控制）

### 布局高度和布局宽度
布局高度和布局宽度两者的控制方法很不一样
1.布局高度
多数情况下，布局中结构化元素（乃至任何元素）的高度是不必设定的。只有这样元素才能随着自己包含内容的增加而在垂直方向上扩展。这样扩展的元素会把下面的元素向下推，而布局也能随着内容数量的增减而垂直伸缩。假如明确设定了元素的高度，那么超出的内容要么被剪掉，要么会跑到容器之外————取决于元素overflow属性的的设定。

2.布局宽度
与高度不同，我们需要更精细的控制布局宽度，以便随着浏览器窗口宽度的合理变化，布局能够做出适当的调整，确保文本行不会过长或过短。如果随意给元素添加内边距、边框，或者元素本身过大，导致浮动元素的宽度超过包含元素的布局宽度，那浮动元素就可能“躲到”其他元素下方。
即使必须设定栏宽，也不要给包含在其中的内容元素设定宽度，应该让这些内容元素自动扩展到填满栏的宽度。简言之，就是让栏宽限制其中内容元素的宽度。

## 三栏-固定宽度布局

为保证每一栏的高度看起来是相同的，可以
圣杯布局和双飞翼布局
圣杯布局来源于文章In Search of the Holy Grail，而双飞翼布局来源于淘宝UED。虽然两者的实现方法略有差异，不过都遵循了以下要点：

两侧宽度固定，中间宽度自适应
中间部分在DOM结构上优先，以便先行渲染
允许三列中的任意一列成为最高列
只需要使用一个额外的<div>标签
圣杯布局
```html
<html>
    <head>
        <title>csslayout</title>
        <style>
            body {
                min-width: 550px;
            }

            #container {
                padding-left: 200px; 
                padding-right: 150px;
            }

            #container .column {
                float: left;
            }

            #center {
                width: 100%;
            }

            #left {
                width: 200px; 
                margin-left: -100%;
                position: relative;
                right: 200px;
            }

            #right {
                width: 150px; 
                margin-right: -150px; 
            }

            #footer {
                clear: both;
            }
        </style>
    </head>
    <body>
        <div id="header"></div>
        <div id="container">
            <div id="center" class="column"></div>
            <div id="left" class="column"></div>
            <div id="right" class="column"></div>
        </div>
        <div id="footer"></div>
    </body>
</html>
```
双飞翼布局
```html
<html>
<head>
	<title>another test</title>
	<style>
		#container {
		  width: 100%;
		}

		.column {
		  float: left;
		}

		#center {
		  margin-left: 200px;
		  margin-right: 150px;
		  background: yellow;
		}

		#left {
		  width: 200px; 
		  margin-left: -100%;
		  margin-right:1px;
		  background: blue;
		}

		#right {
		  width: 150px; 
		  background: green;
		}

		#footer {
		  clear: both;
		}
</style>
	</head>
	<body>
		<div id="header"></div>
		  <div id="container" class="column">
		    <div id="center"></div>
		  </div>
		  <div id="left" class="column"></div>
		  <div id="right" class="column"></div>
		  <div id="footer"></div>
	</body>
</html>
```

### 对于float+负外边距的理解
浮动的作用：
1.将里面的元素包裹（紧紧包裹）
2.将元素尽可能向上向左移动

当元素使用float: left时，当时用margin-left: -x时，若x<元素宽度时，元素响应缩短x，当x>元素宽度时，元素会向上一行移动，覆盖上一行的元素，移动距离为x；
当元素使用float: left时，当时用margin-right: -x时，若x<元素宽度时，元素相应缩短x，当x>元素宽度时，元素会向上一行移动，放到上一行的尾部。