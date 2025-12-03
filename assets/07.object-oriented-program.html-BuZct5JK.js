import{_ as d,a as t,d as a,b as i,h as e,e as l,w as r,f as p,g as c}from"./app-BXqgnaz2.js";const o={};function u(b,n){const s=p("RouteLink");return c(),t("div",null,[n[4]||(n[4]=a(`<h1 id="面向对象的程序设计" tabindex="-1"><a class="header-anchor" href="#面向对象的程序设计"><span>面向对象的程序设计</span></a></h1><h5 id="目标" tabindex="-1"><a class="header-anchor" href="#目标"><span>目标</span></a></h5><blockquote><p>理解对象属性<br> 理解并创建对象<br> 理解继承</p></blockquote><h2 id="一、理解对象" tabindex="-1"><a class="header-anchor" href="#一、理解对象"><span>一、理解对象</span></a></h2><blockquote><p>ECMA-262 把对象定义为:“无序属性的集合，其属性可以包含基本值、对象或者函数。”<br> 我们可以把 ECMAScript 的对象想象成散列表:无非就是一组名值对，其中值可以是数据或函数。<br> 每个对象都是基于一个引用类型创建的。</p></blockquote><h4 id="创建对象方法" tabindex="-1"><a class="header-anchor" href="#创建对象方法"><span>创建对象方法：</span></a></h4><h5 id="object-构造函数" tabindex="-1"><a class="header-anchor" href="#object-构造函数"><span>Object 构造函数</span></a></h5><p>创建自定义对象的最简单方式就是创建一个 Object 的实例，然后再为它添加属性和方法：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var person = new Object();</span>
<span class="line">person.name = &quot;Nicholas&quot;;</span>
<span class="line">person.age = 29;</span>
<span class="line">person.job = &quot;Software Engineer&quot;;</span>
<span class="line">person.sayName = function(){</span>
<span class="line">    alert(this.name);</span>
<span class="line">};</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="对象字面量都" tabindex="-1"><a class="header-anchor" href="#对象字面量都"><span>对象字面量都</span></a></h5><p>对象字面量成为创建这种对象的首选模式：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var person = {</span>
<span class="line">    name: &quot;Nicholas&quot;,</span>
<span class="line">    age: 29,</span>
<span class="line">    job: &quot;Software Engineer&quot;,</span>
<span class="line">    sayName: function(){</span>
<span class="line">        alert(this.name);</span>
<span class="line">    } </span>
<span class="line">};</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_1-属性类型" tabindex="-1"><a class="header-anchor" href="#_1-属性类型"><span>1.属性类型</span></a></h3><p>ECMA-262 第 5 版在定义只有内部才用的特性(attribute)时，描述了属性(property)的各种特征。 ECMAScript 中有两种属性:数据属性和访问器属性。</p><h4 id="_1-1-数据属性" tabindex="-1"><a class="header-anchor" href="#_1-1-数据属性"><span>1.1 数据属性</span></a></h4><p>数据属性包含一个数据值的位置。在这个位置可以读取和写入值。数据属性有 4 个描述其行为的 特性。:</p><ul><li>[Configurable]]:表示能否通过 delete 删除属性从而重新定义属性，能否修改属性的特性，或者能否把属性修改为访问器属性。<strong>直接在对象上定义的属性</strong> 默认值为 true。</li><li>[[Enumerable]]:表示能否通过 for-in 循环返回属性。直接在对象上定义的属性 默认值为 true。</li><li>[[Writable]]: 表示能否修改属性的值。直接在对象上定义的属性 默认值为 true。</li><li>[[Value]]:包含这个属性的数据值。读取属性值的时候，从这个位置读;写入属性值的时候，把新值保存在这个位置。直接在对象上定义的属性 默认值为 undefined。</li></ul><p>要修改属性默认的特性，必须使用 ECMAScript 5 的 Object.defineProperty()方法：这个方法 接收三个参数:属性所在的对象、属性的名字和一个描述符对象；</p><p>把 <strong>configurable</strong> 设置为 false，表示不能从对象中删除属性。如果对这个属性调用 delete，则 在非严格模式下什么也不会发生，而在严格模式下会导致错误。而且，一旦把属性定义为不可配置的， 就不能再把它变回可配置了。 此时，再调用 Object.defineProperty()方法修改除 writable 之外 的特性，都会导致错误:</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var person = {};</span>
<span class="line">Object.defineProperty(person, &quot;name&quot;, {</span>
<span class="line">    configurable: false,</span>
<span class="line">    value: &quot;Nicholas&quot;</span>
<span class="line">});</span>
<span class="line">//抛出错误</span>
<span class="line">Object.defineProperty(person, &quot;name&quot;, {</span>
<span class="line">    configurable: true,</span>
<span class="line">    value: &quot;Nicholas&quot;</span>
<span class="line">});</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>把 <strong>Writable</strong> 设置为 false，这个属性的值是不可修改的，如果尝试为它指定新值，则在非严格模式下，赋值操作将被忽略;在严格模式下，赋值操作将会导 致抛出错误。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var person = {};</span>
<span class="line">Object.defineProperty(person, &quot;name&quot;, {</span>
<span class="line">    writable: false,</span>
<span class="line">    value: &quot;Nicholas&quot;</span>
<span class="line">});</span>
<span class="line">alert(person.name); //&quot;Nicholas&quot; </span>
<span class="line">person.name = &quot;Greg&quot;;  //不可修改</span>
<span class="line">alert(person.name); //&quot;Nicholas&quot;</span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_1-2-访问器属性" tabindex="-1"><a class="header-anchor" href="#_1-2-访问器属性"><span>1.2 访问器属性</span></a></h4><blockquote><p>访问器属性不包含数据值;它们包含一对儿 getter 和 setter 函数(不过，这两个函数都不是必需的)。 在读取访问器属性时，会调用 getter 函数，这个函数负责返回有效的值;在写入访问器属性时，会调用 setter 函数并传入新值，这个函数负责决定如何处理数据.</p></blockquote><p>访问器属性有四个特性：</p><ul><li>[[Configurable]]:表示能否通过 delete 删除属性从而重新定义属性，能否修改属性的特性，或者能否把属性修改为数据属性。<strong>直接在对象上定义的属性</strong> 默认值为 true。</li><li>[[Enumerable]]:表示能否通过 for-in 循环返回属性。<strong>直接在对象上定义的属性</strong> 默认值为 true。</li><li>[[Get]]:在读取属性时调用的函数。 <strong>直接在对象上定义的属性</strong> 默认值为 undefined。</li><li>[[Set]]:在写入属性时调用的函数。 <strong>直接在对象上定义的属性</strong> 默认值为 undefined。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var book = {</span>
<span class="line">    _year: 2004, //_year 前面 的下划线是一种常用的记号，用于表示只能通过对象方法访问的属性。</span>
<span class="line">    edition: 1 </span>
<span class="line">};</span>
<span class="line">Object.defineProperty(book, &quot;year&quot;, {</span>
<span class="line">    get: function(){</span>
<span class="line">        return this._year;</span>
<span class="line">    },</span>
<span class="line">    set: function(newValue){</span>
<span class="line">        if (newValue &gt; 2004) {</span>
<span class="line">            this._year = newValue;</span>
<span class="line">            this.edition += newValue - 2004;</span>
<span class="line">        } </span>
<span class="line">    }</span>
<span class="line">});</span>
<span class="line">book.year = 2005; </span>
<span class="line">alert(book.edition); //2</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-定义多个属性" tabindex="-1"><a class="header-anchor" href="#_2-定义多个属性"><span>2.定义多个属性</span></a></h3><p><strong>Object.defineProperties()</strong>，这个方法可以通过描述符一次定义多个属性。 这个方法接收两个对象参数:第一个对象是 <strong>要添加和修改其属性的对象</strong>，第二个对象的属性与 <strong>第一个对象中要添加或修改的属性一一对应</strong>。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var book = {};</span>
<span class="line">Object.defineProperties(book, {</span>
<span class="line">    _year: {</span>
<span class="line">        value: 2004</span>
<span class="line">    },</span>
<span class="line">    edition: {</span>
<span class="line">        value: 1</span>
<span class="line">    },</span>
<span class="line">    year: {</span>
<span class="line">        get: function(){</span>
<span class="line">            return this._year;</span>
<span class="line">        },</span>
<span class="line">        set: function(newValue){    </span>
<span class="line">            if (newValue &gt; 2004) {</span>
<span class="line">                this._year = newValue;</span>
<span class="line">                this.edition += newValue - 2004;</span>
<span class="line">            }</span>
<span class="line">        } </span>
<span class="line">    }</span>
<span class="line">});</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以上代码在 book 对象上定义了两个数据属性(_year 和 edition)和一个访问器属性(year)。 最终的对象与上一节中定义的对象相同。唯一的<strong>区别是这里的属性都是在同一时间创建</strong>的。</p><p>Object.defineProperty 兼容性： 支持 Object.defineProperties()方法的浏览器有 IE9+、Firefox 4+、Safari 5+、Opera 12+和 Chrome。</p><h3 id="_3-读取属性的特性" tabindex="-1"><a class="header-anchor" href="#_3-读取属性的特性"><span>3.读取属性的特性</span></a></h3><p>使用 ECMAScript 5 的 <strong>Object.getOwnPropertyDescriptor()</strong> 方法，可以取得给定属性的描述符。这个方法接收两个参数:属性所在的<strong>对象</strong>和要读取其描述符的<strong>属性名称</strong>。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var book = {};</span>
<span class="line">Object.defineProperties(book, {</span>
<span class="line">    _year: {</span>
<span class="line">        value: 2004</span>
<span class="line">    },</span>
<span class="line">    edition: {</span>
<span class="line">        value: 1</span>
<span class="line">    },</span>
<span class="line">    year: {</span>
<span class="line">        get: function(){</span>
<span class="line">            return this._year;</span>
<span class="line">        },</span>
<span class="line">        set: function(newValue){    </span>
<span class="line">            if (newValue &gt; 2004) {</span>
<span class="line">                this._year = newValue;</span>
<span class="line">                this.edition += newValue - 2004;</span>
<span class="line">            }</span>
<span class="line">        } </span>
<span class="line">    }</span>
<span class="line">});</span>
<span class="line">var descriptor = Object.getOwnPropertyDescriptor(book, &quot;_year&quot;);</span>
<span class="line">alert(descriptor.value); //2004</span>
<span class="line">alert(descriptor.configurable); //false</span>
<span class="line">alert(typeof descriptor.get); //&quot;undefined&quot;</span>
<span class="line"></span>
<span class="line">var descriptor = Object.getOwnPropertyDescriptor(book, &quot;year&quot;); </span>
<span class="line">alert(descriptor.value); //undefined </span>
<span class="line">alert(descriptor.enumerable); //false</span>
<span class="line">alert(typeof descriptor.get); //&quot;function&quot;</span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>对于数据属性_year，value 等于最初的值，configurable 是 false，而 get 等于 undefined。</li><li>对于访问器属性 year，value 等于 undefined，enumerable 是 false，而 get 是一个指向 getter 函数的指针。</li></ul><h2 id="二、创建对象" tabindex="-1"><a class="header-anchor" href="#二、创建对象"><span>二、创建对象</span></a></h2><blockquote><p>工厂模式<br> 构造函数模式<br> 原型模式<br> 组合使用构造函数模式和原型模式<br> 动态原型模式<br> 寄生构造函数模式<br> 稳妥构造函数模式</p></blockquote><h4 id="工厂模式" tabindex="-1"><a class="header-anchor" href="#工厂模式"><span>工厂模式</span></a></h4><blockquote><p>使用简单的函数创建对象，为对象添加属性和方法，然后返回对象</p></blockquote><p>这个模式后来被构造函数模式所取代。</p><h4 id="构造函数模式" tabindex="-1"><a class="header-anchor" href="#构造函数模式"><span>构造函数模式</span></a></h4><blockquote><p>可以创建自定义引用类型，可以像创建内置对象实例一样使用 new 操作符。</p></blockquote><p>问题：即它的每个成员都无法得到复用，包括函数。由于函数可以不局 限于任何对象(即与对象具有松散耦合的特点)，因此没有理由不在多个对象间共享函数。</p><h4 id="原型模式" tabindex="-1"><a class="header-anchor" href="#原型模式"><span>原型模式</span></a></h4><blockquote><p>使用构造函数的prototype属性来指定那些应该共享的属性和方法。</p></blockquote><h4 id="组合使用构造函数模式和原型模式" tabindex="-1"><a class="header-anchor" href="#组合使用构造函数模式和原型模式"><span>组合使用构造函数模式和原型模式</span></a></h4><blockquote><p>使用构造函数定义实例属性，而使用原型定义共享的属性和方法。</p></blockquote>`,48)),i("p",null,[n[1]||(n[1]=e("详情见 ",-1)),l(s,{to:"/fontend/class1/08.create-object.html"},{default:r(()=>[...n[0]||(n[0]=[e("面向对象的程序设计之创建对象",-1)])]),_:1})]),n[5]||(n[5]=a('<p><strong>对象的 constructor 属性最初是用来标识对象类型的</strong></p><h2 id="三、继承" tabindex="-1"><a class="header-anchor" href="#三、继承"><span>三、继承</span></a></h2><blockquote><p>原型链【很少单独使用】 借用构造函数【很少单独使用】<br> 组合继承【最常用的继承模式】<br> 原型性继承【跟原型链模式类似】<br> 寄生式继承【与寄生构造函数和工厂模式类似】<br> 寄生组合式继承【最理想的继承范式】</p></blockquote><h3 id="原型链" tabindex="-1"><a class="header-anchor" href="#原型链"><span>原型链</span></a></h3><h5 id="基本思想" tabindex="-1"><a class="header-anchor" href="#基本思想"><span>基本思想</span></a></h5><blockquote><p>主要通过原型链实现继承。原型链的构建是通过将一个类型的实例赋值给另一个构造函数的原型实现的。这样，子类型就能够访问超类型的所有属性和方法，这一点与基于类的继承很相似。</p></blockquote><h5 id="问题1-最主要的问题来自包含-引用类型值的原型。引用类型值的原型属性会被所有实例共享。" tabindex="-1"><a class="header-anchor" href="#问题1-最主要的问题来自包含-引用类型值的原型。引用类型值的原型属性会被所有实例共享。"><span>问题1：最主要的问题来自包含 <strong>引用类型值的原型</strong>。引用类型值的原型属性会被所有实例共享。</span></a></h5><h5 id="问题2-在创建子类型的实例时-不能向超类型的构造函数中传递参数。" tabindex="-1"><a class="header-anchor" href="#问题2-在创建子类型的实例时-不能向超类型的构造函数中传递参数。"><span>问题2：在创建子类型的实例时，不能向超类型的构造函数中传递参数。</span></a></h5><h5 id="解决" tabindex="-1"><a class="header-anchor" href="#解决"><span>解决</span></a></h5><p>对象实例共享所有继承的属性和方法，因此不适宜单独使用。原型链的解决这个问题的技术是借用<strong>构造函数</strong></p><h3 id="构造函数" tabindex="-1"><a class="header-anchor" href="#构造函数"><span>构造函数</span></a></h3><h5 id="基本思想-1" tabindex="-1"><a class="header-anchor" href="#基本思想-1"><span>基本思想</span></a></h5><blockquote><p>即在子类型构造函数的内部调用超类型构造函数。这样就可以做到每个实例都具有自己的 属性，同时还能保证只使用构造函数模式来定义类型。</p></blockquote><h5 id="问题-方法都在构造函数中定义-因此函数复用就无从谈起了而且-在超类型的原型中定义的方法-对子类型而言也是不可见的" tabindex="-1"><a class="header-anchor" href="#问题-方法都在构造函数中定义-因此函数复用就无从谈起了而且-在超类型的原型中定义的方法-对子类型而言也是不可见的"><span>问题:方法都在构造函数中定义，因此函数复用就无从谈起了而且，在超类型的原型中定义的方法，对子类型而言也是不可见的.</span></a></h5><h3 id="组合继承" tabindex="-1"><a class="header-anchor" href="#组合继承"><span>组合继承</span></a></h3><h5 id="基本思想-2" tabindex="-1"><a class="header-anchor" href="#基本思想-2"><span>基本思想</span></a></h5><blockquote><p>使用原型链继承共享的属性和方法，而通过借用构造函数继承实例属性。 问题：</p></blockquote><h5 id="优点" tabindex="-1"><a class="header-anchor" href="#优点"><span>优点：</span></a></h5><p>既通过在原型上定义方法实现了函数复用，又能够保证每个实例都有它自己的属性。</p><h3 id="原型式继承" tabindex="-1"><a class="header-anchor" href="#原型式继承"><span>原型式继承</span></a></h3><h5 id="基本思想-3" tabindex="-1"><a class="header-anchor" href="#基本思想-3"><span>基本思想</span></a></h5><blockquote><p>可以在不必预先定义构造函数的情况下实现继承，其本质是执行对给定对象的浅复制。而复制得到的副本还可以得到进一步改造。</p></blockquote><h5 id="问题-跟原型模式一样-引用类型值的原型属性会被所有实例共享。" tabindex="-1"><a class="header-anchor" href="#问题-跟原型模式一样-引用类型值的原型属性会被所有实例共享。"><span>问题：跟原型模式一样，引用类型值的原型属性会被所有实例共享。</span></a></h5><h5 id="解决-这个模式后来被构造函数模式所取代。" tabindex="-1"><a class="header-anchor" href="#解决-这个模式后来被构造函数模式所取代。"><span>解决：这个模式后来被构造函数模式所取代。</span></a></h5><h3 id="寄生式继承" tabindex="-1"><a class="header-anchor" href="#寄生式继承"><span>寄生式继承</span></a></h3><h5 id="基本思想-4" tabindex="-1"><a class="header-anchor" href="#基本思想-4"><span>基本思想</span></a></h5><blockquote><p>与原型式继承非常相似，也是基于某个对象或某些信息创建一个对象，然后增强对象，最后返回对象。</p></blockquote><h5 id="用途-为了解决组合继承模式由于多次调用超类型构造函数而导致的低效率问题-可以将这个模式与组合继承一起使用。" tabindex="-1"><a class="header-anchor" href="#用途-为了解决组合继承模式由于多次调用超类型构造函数而导致的低效率问题-可以将这个模式与组合继承一起使用。"><span>用途：为了解决组合继承模式由于多次调用超类型构造函数而导致的低效率问题，可以将这个模式与组合继承一起使用。</span></a></h5><h3 id="寄生组合式继承" tabindex="-1"><a class="header-anchor" href="#寄生组合式继承"><span>寄生组合式继承</span></a></h3><h5 id="基本思想-5" tabindex="-1"><a class="header-anchor" href="#基本思想-5"><span>基本思想：</span></a></h5><blockquote><p>集寄生式继承和组合继承的优点与一身，是实现基于类型继承的最有效方式。</p></blockquote><h5 id="优点-1" tabindex="-1"><a class="header-anchor" href="#优点-1"><span>优点</span></a></h5><ul><li>这个例子的高效率体现在它只调用了一次 SuperType 构造函数，</li><li>并且因此避免了在 SubType.prototype 上面创建不必要的、多余的属性。</li><li>与此同时，原型链还能保持不变；</li><li>因此，还能够正常使用instanceof 和 isPrototypeOf()。</li><li>开发人员普遍认为寄生组合式继承是引用类型<strong>最理想的继承范式</strong>。</li></ul>',33)),i("p",null,[n[3]||(n[3]=e("详情见 ",-1)),l(s,{to:"/fontend/class1/09.inheritance.html"},{default:r(()=>[...n[2]||(n[2]=[e("面向对象的程序设计之继承",-1)])]),_:1})])])}const h=d(o,[["render",u]]),m=JSON.parse('{"path":"/fontend/class1/07.object-oriented-program.html","title":"面向对象的程序设计","lang":"zh-CN","frontmatter":{},"git":{"updatedTime":1764128360000,"contributors":[{"name":"lumi","username":"lumi","email":"lumiya1228@gmail.com","commits":1,"url":"https://github.com/lumi"}],"changelog":[{"hash":"cf2f85e78da6745fae651d3e778926f1ac985f47","time":1764128360000,"email":"lumiya1228@gmail.com","author":"lumi","message":"docs: restructure front-end and offer sections, add new content and navigation links"}]},"filePathRelative":"fontend/class1/07.object-oriented-program.md"}');export{h as comp,m as data};
