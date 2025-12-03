import{_ as d,a as t,d as i,b as n,h as a,e as l,w as r,f as c,g as u}from"./app-BXqgnaz2.js";const p={};function o(v,s){const e=c("RouteLink");return u(),t("div",null,[s[4]||(s[4]=i('<h1 id="基本概念" tabindex="-1"><a class="header-anchor" href="#基本概念"><span>基本概念</span></a></h1><h2 id="一、语法" tabindex="-1"><a class="header-anchor" href="#一、语法"><span>一、语法</span></a></h2><h4 id="区分大小写" tabindex="-1"><a class="header-anchor" href="#区分大小写"><span>区分大小写</span></a></h4><h4 id="标识符" tabindex="-1"><a class="header-anchor" href="#标识符"><span>标识符</span></a></h4><p>就是指变量、函数、属性的名字，或者函数的参数</p><ul><li>第一个字符必须是一个字母、下划线(_)或一个美元符号($);</li><li>其他字符可以是字母、下划线、美元符号或数字；</li><li>ECMAScript 标识符采用驼峰大小写格式；</li><li>let 和 yield 是第 5 版新增的保留字，第 5 版对 eval 和 arguments 还施加了限制。在严格模式下，这两个名字也不能作为标识符或属性名，</li></ul><h4 id="注释" tabindex="-1"><a class="header-anchor" href="#注释"><span>注释</span></a></h4><ul><li>单行 //</li><li>多行 /* */</li></ul><h4 id="严格模式" tabindex="-1"><a class="header-anchor" href="#严格模式"><span>严格模式</span></a></h4><ul><li>严格模式下，ECMAScript 3 中的一些不确定的行为将得到处理，而且对某些不安全 的操作也会抛出错误；</li><li>启用严格模式，可以在顶部添加如下代码:<code>&quot;use strict&quot;</code>;</li></ul><h4 id="语句" tabindex="-1"><a class="header-anchor" href="#语句"><span>语句</span></a></h4><ul><li>ECMAScript 中的语句以一个分号结尾;如果省略分号，则由解析器确定语句的结尾。</li></ul><h2 id="二、关键字和保留字" tabindex="-1"><a class="header-anchor" href="#二、关键字和保留字"><span>二、关键字和保留字</span></a></h2><ul><li>关键字和保留字都不能用作标识符</li><li>关键字可用于表示控制语句的开始或结束，或者用于执行特定操作等。如break、typeof、var、for 等</li><li>尽管保留字在这门语言中还没有任何特定的用途，但它们有可能在将来被用作关键字，如let、abstract、boolean、class、extends等</li><li>关键字和保留字虽然仍然不能作为标识符使 用，但现在可以用作对象的属性名</li></ul><h2 id="三、变量" tabindex="-1"><a class="header-anchor" href="#三、变量"><span>三、变量</span></a></h2><ul><li>ECMAScript 的变量是松散类型的，所谓松散类型就是可以用来保存任何类型的数据。</li><li>定义变量时要使用 var 操作符 <code>var message = &quot;hi&quot;;</code></li><li>可以在修改变量值的同时修改值的类型，【有效但不推荐】</li><li>如果在函数中使用 var 定义一个变量，那么这个变量在函数退出后就会被销毁，</li><li>虽然省略 var 操作符可以定义全局变量，【有效但不推荐】</li><li>可以使用一条语句定义多个变量只要像下面这样把每个变量(初始化或不初始化均可)用逗号分 隔开即可</li></ul><h2 id="四、数据类型" tabindex="-1"><a class="header-anchor" href="#四、数据类型"><span>四、数据类型</span></a></h2><ul><li>简单数据类型：Undefined、Null、Boolean、Number 和 String。</li><li>复杂数据类型：Object</li></ul>',18)),n("p",null,[s[1]||(s[1]=a("详情见 ",-1)),l(e,{to:"/fontend/class1/04.data-type.html"},{default:r(()=>[...s[0]||(s[0]=[a("基本概念之数据类型",-1)])]),_:1})]),s[5]||(s[5]=n("h2",{id:"五、操作符",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#五、操作符"},[n("span",null,"五、操作符")])],-1)),s[6]||(s[6]=n("p",null,"一元操作符、位操作符、布尔操作符、乘性操作符、加性操作符、关系操作符、相等操作符、条件操作符、赋值操作符、逗号操作符",-1)),n("p",null,[s[3]||(s[3]=a("详情见 ",-1)),l(e,{to:"/fontend/class1/05.operator.html"},{default:r(()=>[...s[2]||(s[2]=[a("基本概念之操作符",-1)])]),_:1})]),s[7]||(s[7]=i(`<h2 id="六、语句" tabindex="-1"><a class="header-anchor" href="#六、语句"><span>六、语句</span></a></h2><h4 id="if语句" tabindex="-1"><a class="header-anchor" href="#if语句"><span>if语句</span></a></h4><ul><li>条件可以是任意表达式，而且对这个表达式求值的结果不一定是布尔值。</li><li>ECMAScript 会自动调用 Boolean()转换函数将这个表达式的结果转换为一个布尔值。</li></ul><h4 id="do-while语句" tabindex="-1"><a class="header-anchor" href="#do-while语句"><span>do-while语句</span></a></h4><ul><li>*do-while 语句是一种<strong>后测试</strong>循环语句，即只有在循环体中的代码执行之后，才会测试出口条件。</li><li>在对条件表达式求值之前，循环体内的代码至少会被执行一次。</li><li>常用于循环体中的代码至少要被执行一次的情形。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">do {</span>
<span class="line">    statement</span>
<span class="line">} while (expression);</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="while语句" tabindex="-1"><a class="header-anchor" href="#while语句"><span>while语句</span></a></h4><ul><li>while 语句属于<strong>前测试</strong>循环语句，也就是说，在循环体内的代码被执行之前，就会对出口条件求值。因此循环体内的代码有可能永远不会被执行。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">while(expression) {statement}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h4 id="for语句" tabindex="-1"><a class="header-anchor" href="#for语句"><span>for语句</span></a></h4><ul><li>for 语句也是一种前测试循环语句，但它具有在执行循环之前初始化变量和定义循环后要执行的代 码的能力。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">for (initialization; expression; post-loop-expression) {statement}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>for创建无线循环：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">for (;;) {</span>
<span class="line">    console.log(1)</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="for-in语句" tabindex="-1"><a class="header-anchor" href="#for-in语句"><span>for-in语句</span></a></h4><ul><li>for-in 语句是一种精准的迭代语句，可以用来枚举<strong>对象</strong>的属性。</li><li>通过 for-in 循环输出的属性名的顺序是不可预测的。</li><li>如果表示要迭代的对象的变量值为 null 或 undefined，for-in 语句会抛出错误。 ECMAScript 5 更正了这一行为;对这种情况不再抛出错误，而只是不执行循环体。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var obj={a:1,b:4 ,c:9}</span>
<span class="line">for (var item in obj) {</span>
<span class="line">     console.log(item); //a b c</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="label语句" tabindex="-1"><a class="header-anchor" href="#label语句"><span>label语句</span></a></h4><ul><li>使用 label 语句可以在代码中添加标签，以便将来使用 不重要，暂不了解</li></ul><h4 id="break和continue语句" tabindex="-1"><a class="header-anchor" href="#break和continue语句"><span>break和continue语句</span></a></h4><ul><li>break 和 continue 语句用于在循环中精确地控制代码的执行</li><li>break 语句会立即退出循环， 强制继续执行循环后面的语句。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var num = 0;</span>
<span class="line">for (var i=1; i &lt; 10; i++) {</span>
<span class="line">    if (i % 5 == 0) {</span>
<span class="line">        break; </span>
<span class="line">    }</span>
<span class="line">    num++; </span>
<span class="line">}</span>
<span class="line">alert(num);    //4</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>continue 语句虽然也是立即退出循环，但退出循环后会从循环的顶部继续执行。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var num = 0;</span>
<span class="line">for (var i=1; i &lt; 10; i++) {</span>
<span class="line">    if (i % 5 == 0) {</span>
<span class="line">        continue; </span>
<span class="line">    }</span>
<span class="line">    num++; </span>
<span class="line">}</span>
<span class="line">alert(num);    //8</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="with语句" tabindex="-1"><a class="header-anchor" href="#with语句"><span>with语句</span></a></h4><ul><li>with 语句的作用是将代码的作用域设置到一个特定的对象中</li><li>目的主要是为了简化多次编写同一个对象的工作</li></ul><p>实例</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">with</span>
<span class="line">var qs = location.search.substring(1);</span>
<span class="line">var hostName = location.hostname;</span>
<span class="line">var url = location.href;</span>
<span class="line"></span>
<span class="line">//上面几行代码都包含 location 对象。如果使用 with 语句:</span>
<span class="line">with(location){</span>
<span class="line">    var qs = search.substring(1);</span>
<span class="line">    var hostName = hostname;</span>
<span class="line">    var url = href;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>严格模式下不允许使用 with 语句，否则将视为语法错误。</li><li>由于大量使用 with 语句会导致性能下降，同时也会给调试代码造成困难，因此在开发大型应用程序时，不建议使用 with 语句。</li></ul><h4 id="switch语句" tabindex="-1"><a class="header-anchor" href="#switch语句"><span>switch语句</span></a></h4><ul><li>switch 语句与 if 语句的关系最为密切，而且也是在其他语言中普遍使用的一种流控制语句。</li><li>每个 case 后面都添加一个 break 语句，就可以避免同时执行多个 case 代码的情况</li><li>每个 case 的值不一定是常量，可以是变量，甚至是表达式。</li><li>switch 语句在比较值时使用的是全等操作符，因此不会发生类型转换</li></ul><p>流控制语句：if语句 VS switch语句：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var i=10</span>
<span class="line">if (i == 25){</span>
<span class="line">  alert(&quot;25&quot;);</span>
<span class="line">} else if (i == 35) {</span>
<span class="line">  alert(&quot;35&quot;);</span>
<span class="line">} else if (i == 45) {</span>
<span class="line">  alert(&quot;45&quot;);</span>
<span class="line">}else {</span>
<span class="line">  alert(&quot;Other&quot;);</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">switch (i) {</span>
<span class="line">    case 25:</span>
<span class="line">        alert(&quot;25&quot;);</span>
<span class="line">        break;</span>
<span class="line">    case 35:</span>
<span class="line">        alert(&quot;35&quot;);</span>
<span class="line">        break;</span>
<span class="line">    case 45:</span>
<span class="line">        alert(&quot;45&quot;);</span>
<span class="line">        break;</span>
<span class="line">    default:</span>
<span class="line">        alert(&quot;Other&quot;);</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="七、函数" tabindex="-1"><a class="header-anchor" href="#七、函数"><span>七、函数</span></a></h2><ul><li>通过函数可以封装任意多条语句，而且可以在任何地方、 任何时候调用执行。</li><li>任何函数在任何时候都可以通过 return 语句后跟要返回的值来实现返回值，这个函数会在执行完 return 语句之后停止并立即退出。</li><li></li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function sayHi(name, message) {</span>
<span class="line">    alert(&quot;Hello &quot; + name + &quot;,&quot; + message);</span>
<span class="line">}</span>
<span class="line">sayHi(&quot;Nicholas&quot;, &quot;how are you today?&quot;);</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="理解参数" tabindex="-1"><a class="header-anchor" href="#理解参数"><span>理解参数</span></a></h4><ul><li>在函数体内可以通过 arguments 对象来 访问这个参数数组，从而获取传递给函数的每一个参数。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function sayHi() {</span>
<span class="line">    alert(&quot;Hello &quot; + arguments[0] + &quot;,&quot; + arguments[1]);</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>通过访问 arguments 对象的 length 属性可以获知有多少个参数传递给了函数。</li><li>arguments 对象可以与命名参数一起使用。</li><li>因为 arguments 对象中的值会自动反映到对应的命名参数，所以修改 arguments[1]，也就修改了 第二个参数num2。</li><li>没有传递值的命名参数将自动被赋予 undefined 值。这就跟定义了 变量但又没有初始化一样。</li><li>严格模式，重写 arguments 的值会导致语法错误</li><li>ECMAScript 中的所有参数传递的都是值，不可能通过引用传递参数。</li></ul><h4 id="没有重载" tabindex="-1"><a class="header-anchor" href="#没有重载"><span>没有重载</span></a></h4><ul><li>如果在 ECMAScript 中定义了两个名字相同的函数，则该名字只属于后定义的函数。</li><li>通过检查传入函数中参数的类型和数量并作出不同的反应，可以模仿方法的重载。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function addSomeNumber(num){</span>
<span class="line">    return num + 100;</span>
<span class="line">}</span>
<span class="line">function addSomeNumber(num) {</span>
<span class="line">    return num + 200;</span>
<span class="line">}</span>
<span class="line">var result = addSomeNumber(100);</span>
<span class="line">//300</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,43))])}const h=d(p,[["render",o]]),b=JSON.parse('{"path":"/fontend/class1/03.basic-concept.html","title":"基本概念","lang":"zh-CN","frontmatter":{},"git":{"updatedTime":1764128360000,"contributors":[{"name":"lumi","username":"lumi","email":"lumiya1228@gmail.com","commits":1,"url":"https://github.com/lumi"}],"changelog":[{"hash":"cf2f85e78da6745fae651d3e778926f1ac985f47","time":1764128360000,"email":"lumiya1228@gmail.com","author":"lumi","message":"docs: restructure front-end and offer sections, add new content and navigation links"}]},"filePathRelative":"fontend/class1/03.basic-concept.md"}');export{h as comp,b as data};
