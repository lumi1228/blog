import{_ as s,a as e,d as a,g as i}from"./app-BXqgnaz2.js";const l={};function r(t,n){return i(),e("div",null,[...n[0]||(n[0]=[a(`<h1 id="面向对象的程序之创建对象" tabindex="-1"><a class="header-anchor" href="#面向对象的程序之创建对象"><span>面向对象的程序之创建对象</span></a></h1><h4 id="主要内容" tabindex="-1"><a class="header-anchor" href="#主要内容"><span>主要内容</span></a></h4><blockquote><p>工厂模式<br> 构造函数模式<br> 原型模式<br> 组合使用构造函数模式和原型模式<br> 动态原型模式<br> 寄生构造函数模式<br> 稳妥构造函数模式</p></blockquote><p>背景：</p><p>虽然 <strong>Object 构造函数</strong>或<strong>对象字面量</strong>都可以用来创建单个对象，但这些方式有个明显的缺点: 使用同一个接口创建很多对象，会产生大量的重复代码。人们开始使用工厂模式的一种变体。</p><h2 id="一、工厂模式" tabindex="-1"><a class="header-anchor" href="#一、工厂模式"><span>一、工厂模式</span></a></h2><p>这种模式抽象了创建具体对象的过程，考虑到在 ECMAScript 中无法创建类，用<strong>函数来封装</strong>以特定接口创建对象的细节。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function createPerson(name, age, job){</span>
<span class="line">        var o = new Object();</span>
<span class="line">        o.name = name;</span>
<span class="line">        o.age = age;</span>
<span class="line">        o.job = job;</span>
<span class="line">        o.sayName = function(){</span>
<span class="line">            alert(this.name);</span>
<span class="line">        };</span>
<span class="line">    return o; </span>
<span class="line">}</span>
<span class="line">var person1 = createPerson(&quot;Nicholas&quot;, 29, &quot;Software Engineer&quot;);</span>
<span class="line">var person2 = createPerson(&quot;Greg&quot;, 27, &quot;Doctor&quot;);</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>函数 createPerson()能够根据接受的参数来构建一个包含所有必要信息的 Person 对象。可以无 数次地调用这个函数，而每次它都会返回一个包含三个属性一个方法的对象。</p><h5 id="使用工厂模式的问题" tabindex="-1"><a class="header-anchor" href="#使用工厂模式的问题"><span>使用工厂模式的问题</span></a></h5><p>工厂模式虽然 <strong>解决了创建多个相似对象的问题</strong>，但却<strong>没有解决对象识别的问题</strong>(即怎样知道一个对象的类型)。 随着 JavaScript 的发展，又一个新模式出现了。</p><h2 id="二、构造函数模式" tabindex="-1"><a class="header-anchor" href="#二、构造函数模式"><span>二、构造函数模式</span></a></h2><blockquote><p>构造函数可用来创建特定类型的对象，在运行时会自动出现在执行环境中（如Object）。</p></blockquote><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function Person(name, age, job){</span>
<span class="line">        this.name = name;</span>
<span class="line">        this.age = age;</span>
<span class="line">        this.job = job;</span>
<span class="line">        this.sayName = function(){</span>
<span class="line">            alert(this.name);</span>
<span class="line">}; }</span>
<span class="line">var person1 = new Person(&quot;Nicholas&quot;, 29, &quot;Software Engineer&quot;);</span>
<span class="line">var person2 = new Person(&quot;Greg&quot;, 27, &quot;Doctor&quot;);</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>构造函数始终都应该以一个 大写字母开头，而非构造函数则应该以一个小写字母开头；要创建 Person 的新实例，必须使用 new 操作符。 以这种方式定义的构造函数是定义在 Global 对象(在浏览器中是 <strong>window 对象</strong>)中的。</p><h4 id="以这种方式调用构造函数实际上会经历以下-4-个步骤" tabindex="-1"><a class="header-anchor" href="#以这种方式调用构造函数实际上会经历以下-4-个步骤"><span>以这种方式调用构造函数实际上会经历以下 4 个步骤:</span></a></h4><ul><li>(1) 创建一个新对象;</li><li>(2) 将构造函数的作用域赋给新对象(因此 this 就指向了这个新对象);</li><li>(3) 执行构造函数中的代码(为这个新对象添加属性);</li><li>(4) 返回新对象。</li></ul><h4 id="将构造函数当作函数" tabindex="-1"><a class="header-anchor" href="#将构造函数当作函数"><span>将构造函数当作函数</span></a></h4><blockquote><p>构造函数与其他函数的唯一区别，就在于调用它们的方式不同。<br> 任何函数，只要通过 new 操作符来调用，那它就可以作为构造函数;<br> 而任何函数，如果不通过 new 操作符来调用，那它就是普通函数。</p></blockquote><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">// 当作构造函数使用</span>
<span class="line">var person = new Person(&quot;Nicholas&quot;, 29, &quot;Software Engineer&quot;); </span>
<span class="line">person.sayName(); //&quot;Nicholas&quot;</span>
<span class="line">     </span>
<span class="line">// 作为普通函数调用</span>
<span class="line">Person(&quot;Greg&quot;, 27, &quot;Doctor&quot;); // 添加到window </span>
<span class="line">window.sayName(); //&quot;Greg&quot;</span>
<span class="line"></span>
<span class="line">// 在另一个对象的作用域中调用</span>
<span class="line">var o = new Object();</span>
<span class="line">Person.call(o, &quot;Kristen&quot;, 25, &quot;Nurse&quot;); </span>
<span class="line">o.sayName(); //&quot;Kristen&quot;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>使用 call() 在 o 的作用域中调用 Person()函数。因此调用后 o 就拥有了所有属性和 sayName() 方法。</strong></p><h5 id="使用构造函数的主要问题" tabindex="-1"><a class="header-anchor" href="#使用构造函数的主要问题"><span>使用构造函数的主要问题</span></a></h5><p>就是每个方法都要在每个实例上重新创建一遍。在前面的例子中，person1 和 person2 都有一个名为 sayName()的方法，但那 两个方法不是同一个 Function 的实例 ，以这种方式创建函数，会导致不同的作用域链和标识符解析，</p><p>为了便于理解上面构造函数的用法也就等价于：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function Person(name, age, job){</span>
<span class="line">    this.name = name;</span>
<span class="line">    this.age = age;</span>
<span class="line">    this.job = job;</span>
<span class="line">    this.sayName = new Function(&quot;alert(this.name)&quot;); // 与声明函数在逻辑上是等价的</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>因此，不同实例上的同名函数是不相等的，<code>person1.sayName == person2.sayName //false</code></p><h5 id="解决方案" tabindex="-1"><a class="header-anchor" href="#解决方案"><span>解决方案：</span></a></h5><p>创建两个完成同样任务的 Function 实例的确没有必要;况且有 this 对象在，根本不用在 执行代码前就把函数绑定到特定对象上面。因此，大可像下面这样，通过把函数定义转移到构造函数外部来解决这个问题。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function Person(name, age, job){</span>
<span class="line">    this.name = name;</span>
<span class="line">    this.age = age;</span>
<span class="line">    this.job = job;</span>
<span class="line">    this.sayName = sayName;</span>
<span class="line">}</span>
<span class="line">function sayName(){</span>
<span class="line">    alert(this.name);</span>
<span class="line">}</span>
<span class="line">var person1 = new Person(&quot;Nicholas&quot;, 29, &quot;Software Engineer&quot;);</span>
<span class="line">var person2 = new Person(&quot;Greg&quot;, 27, &quot;Doctor&quot;);</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>sayName()函数的定义转移到了构造函数外部，我们将 sayName 属性设置成等于全局的 sayName 函数。由于 sayName 包含的是一个指向函数 的指针，因此 person1 和 person2 对象就共享了在全局作用域中定义的同一个 sayName()函数。</p><h5 id="新的问题" tabindex="-1"><a class="header-anchor" href="#新的问题"><span>新的问题：</span></a></h5><p>在全局作用域中定义的函数实际上只能被某个对象调用，这让全局作用域有点名不副实。而更让人无法接受的是:如果对象需要定义很多方法，那么就要定义很多个全局函数，于是我们这个自定义的引用类型就丝毫没有封装性可言了。好在， 这些问题可以通过使用原型模式来解决。</p><h2 id="三、原型模式" tabindex="-1"><a class="header-anchor" href="#三、原型模式"><span>三、原型模式</span></a></h2><blockquote><p>原型对象的好处是可以 让所有<strong>对象实例共享它所包含的属性和方法</strong>。</p></blockquote><p>用原型创建对象的方法：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function Person(){</span>
<span class="line">}</span>
<span class="line">Person.prototype.name = &quot;Nicholas&quot;;</span>
<span class="line">Person.prototype.age = 29;</span>
<span class="line">Person.prototype.job = &quot;Software Engineer&quot;;</span>
<span class="line">Person.prototype.sayName = function(){</span>
<span class="line">    alert(this.name);</span>
<span class="line">};</span>
<span class="line">var person1 = new Person();</span>
<span class="line">person1.sayName();   //&quot;Nicholas&quot;</span>
<span class="line">var person2 = new Person();</span>
<span class="line">person2.sayName(); //&quot;Nicholas&quot;</span>
<span class="line">alert(person1.sayName == person2.sayName);  //true</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_1-理解原型对象" tabindex="-1"><a class="header-anchor" href="#_1-理解原型对象"><span>1.理解原型对象</span></a></h3><h4 id="_1-1-理解原型对象" tabindex="-1"><a class="header-anchor" href="#_1-1-理解原型对象"><span>1-1.理解原型对象</span></a></h4><ul><li>无论什么时候，只要创建了一个新函数，就会根据一组特定的规则为该函数创建一个 <strong>prototype 属性</strong>，这个属性指向<strong>函数的原型对象</strong>。</li><li>在默认情况下，所有<strong>原型对象</strong>都会自动获得一个 <strong>constructor (构造函数)属性</strong>，这个属性包含一个<strong>指向 prototype 属性所在函数的指针</strong>。</li><li>当调用构造函数创建一个新实例后，该<strong>实例的内部将包含一个指针</strong>(内部属性)，指向<strong>构造函数的原型对象</strong>。</li></ul><h4 id="_1-2-person-构造函数、person-的原型属性以及-person-现有的两个实例之间的关系。" tabindex="-1"><a class="header-anchor" href="#_1-2-person-构造函数、person-的原型属性以及-person-现有的两个实例之间的关系。"><span>1-2.Person 构造函数、Person 的原型属性以及 Person 现有的两个实例之间的关系。</span></a></h4><p>见图6-1</p><p>解析：</p><ul><li>Person.prototype 指向了原型对象，而 Person.prototype.constructor 又指回了 Person。</li><li>原型对象中除了包含 constructor 属性之外，还包括后来添加的其他属性。</li><li>Person 的每个实例 person1 和 person2 都包含一个内部属性，该属性仅仅指向了 Person.prototype;换句话说，它们与构造函数没有直接的关系。</li></ul><h4 id="_1-3-原型对象的-isprototypeof-方法" tabindex="-1"><a class="header-anchor" href="#_1-3-原型对象的-isprototypeof-方法"><span>1-3.原型对象的 isPrototypeOf()方法</span></a></h4><p>原理：isPrototypeOf() 是原型对象的方法，检测一个对象是否存在于另一个对象的原型链中，如果存在就返回 true，否则就返回 false。</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">alert(Person.prototype.isPrototypeOf(person1));  //true</span>
<span class="line">alert(Person.prototype.isPrototypeOf(person2));  //true</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>person1 person2，它们内部都 有一个指向 Person.prototype 的指针，因此都返回了 true。</p><h4 id="_1-4-es5新增方法-object-getprototypeof" tabindex="-1"><a class="header-anchor" href="#_1-4-es5新增方法-object-getprototypeof"><span>1-4.ES5新增方法：Object.getPrototypeOf()</span></a></h4><p>原理：：Object.getPrototypeOf() 方法返回指定对象的原型 (即内部[[Prototype]]属性）</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">alert(Object.getPrototypeOf(person1) == Person.prototype); //true </span>
<span class="line">alert(Object.getPrototypeOf(person1).name); //&quot;Nicholas&quot;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>缺点：getPrototypeOf执行指定对象的 构造函数的原型，不会沿原型链判断类型</p><h4 id="_1-5-不能通过对象实例重写原型中的值。" tabindex="-1"><a class="header-anchor" href="#_1-5-不能通过对象实例重写原型中的值。"><span>1-5.不能通过对象实例重写原型中的值。</span></a></h4><ul><li>当为对象实例添加一个属性时，这个属性就会屏蔽原型对象中保存的同名属性;</li><li>使用 delete 操作符则可以完全删除实例属性，从而让我们能够重新访问原型中的属性;</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">person1.name = &quot;Greg&quot;;</span>
<span class="line">alert(person1.name);//&quot;Greg&quot;——来自实例</span>
<span class="line">alert(person2.name);  //&quot;Nicholas&quot;——来自原型</span>
<span class="line">delete person1.name;</span>
<span class="line">alert(person1.name); //&quot;Nicholas&quot;——来自原型</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_1-6-hasownproperty-方法" tabindex="-1"><a class="header-anchor" href="#_1-6-hasownproperty-方法"><span>1-6.hasOwnProperty()方法</span></a></h4><ul><li>hasOwnProperty()方法可以检测一个属性是存在于实例中，还是存在于原型中。</li><li>只在给定属性存在于对象<strong>实例中</strong>时，才会返回 true。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var person1 = new Person();</span>
<span class="line">var person2 = new Person();</span>
<span class="line">alert(person1.hasOwnProperty(&quot;name&quot;));  //false</span>
<span class="line">person1.name = &quot;Greg&quot;;</span>
<span class="line">alert(person1.name); //&quot;Greg&quot;——来自实例 </span>
<span class="line">alert(person1.hasOwnProperty(&quot;name&quot;)); //true</span>
<span class="line"></span>
<span class="line">alert(person2.name); //&quot;Nicholas&quot;——来自原型 </span>
<span class="line">alert(person2.hasOwnProperty(&quot;name&quot;)); //false</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-原型与-in-操作符" tabindex="-1"><a class="header-anchor" href="#_2-原型与-in-操作符"><span>2. 原型与 in 操作符</span></a></h3><p>有两种方式使用 in 操作符:单独使用 和 在 for-in 循环中使用。</p><h4 id="_2-1-单独使用-in-操作符" tabindex="-1"><a class="header-anchor" href="#_2-1-单独使用-in-操作符"><span>2-1.单独使用 in 操作符</span></a></h4><ul><li>在单独使用时，in 操作符会在通过对象能够访问给定属性时返回 true，无论该属性存在于实例中还是原型中。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">person1.name = &quot;Greg&quot;;</span>
<span class="line">alert(&quot;name&quot; in person1); //true ——来自实例</span>
<span class="line"></span>
<span class="line">alert(person2.name); //&quot;Nicholas&quot; </span>
<span class="line">alert(&quot;name&quot; in person2); //true ——来自原型 </span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-2-同时使用-hasownproperty-方法和-in-操作符" tabindex="-1"><a class="header-anchor" href="#_2-2-同时使用-hasownproperty-方法和-in-操作符"><span>2-2. 同时使用 hasOwnProperty()方法和 in 操作符</span></a></h4><p>同时使用 hasOwnProperty()方法和 in 操作符,就可以确定该<strong>属性到底是存在于对象中，还是存在于原型中</strong>，</p><p>确定是原型中的属性：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function hasPrototypeProperty(object, name){</span>
<span class="line">    return !object.hasOwnProperty(name) &amp;&amp; (name in object);</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>用法：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var person = new Person();</span>
<span class="line">alert(hasPrototypeProperty(person, &quot;name&quot;));  //true --此时name是原型中的属性</span>
<span class="line">person.name = &quot;Greg&quot;;</span>
<span class="line">alert(hasPrototypeProperty(person, &quot;name&quot;));  //false</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-3-在-for-in-循环中使用" tabindex="-1"><a class="header-anchor" href="#_2-3-在-for-in-循环中使用"><span>2-3. 在 for-in 循环中使用</span></a></h4><ul><li>在使用 for-in 循环时，返回的是所有能够通过对象访问的、可枚举的(enumerated)属性，其中 既包括存在于实例中的属性，也包括存在于原型中的属性。</li><li>屏蔽了原型中不可枚举属性(即将 [[Enumerable]]标记为 false 的属性)</li><li>实例属性也会在 for-in 循环中返回，因为根据规定，所有开发人员定义的属性都是可枚举的</li></ul><h4 id="_2-4-es5-的-object-keys-方法-取得对象上所有可枚举的实例属性" tabindex="-1"><a class="header-anchor" href="#_2-4-es5-的-object-keys-方法-取得对象上所有可枚举的实例属性"><span>2-4. ES5 的 Object.keys()方法：取得对象上所有可枚举的实例属性</span></a></h4><ul><li>Object.keys()方法：接收一个对象作为参数，返回一个包含所有可枚举属性的字符串数组</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var keys = Object.keys(Person.prototype);</span>
<span class="line">alert(keys);       //&quot;name,age,job,sayName&quot;</span>
<span class="line"></span>
<span class="line">var p1 = new Person();</span>
<span class="line">p1.name = &quot;Rob&quot;;</span>
<span class="line">p1.age = 31;</span>
<span class="line">var p1keys = Object.keys(p1);</span>
<span class="line">alert(p1keys);    //&quot;name,age&quot;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果是通过 Person 的实例调用，则 Object.keys() 返回的数组只包含&quot;name&quot;和&quot;age&quot;这两个实例属性。</p><p>的顺序。如果是通过 Person 的实例调用，则 Object.keys() 返回的数组只包含&quot;name&quot;和&quot;age&quot;这两个实例属性。 如果你想要得到所有实例属性，无论它是否可枚举，都可以使用 Object.getOwnPropertyNames() 方法。</p><h4 id="_2-5-object-getownpropertynames-方法" tabindex="-1"><a class="header-anchor" href="#_2-5-object-getownpropertynames-方法"><span>2-5. Object.getOwnPropertyNames()方法</span></a></h4><ul><li>Object.getOwnPropertyNames()方法：得到所有实例属性，无论它是否可枚举</li><li>Object.keys()和 Object.getOwnProperty- Names()方法都可以用来替代 for-in 循环。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var keys = Object.getOwnPropertyNames(Person.prototype);</span>
<span class="line">alert(keys);    //&quot;constructor,name,age,job,sayName&quot;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>问题：包含了不可枚举的 constructor 属性。</p><h3 id="_3-更简单的原型语法" tabindex="-1"><a class="header-anchor" href="#_3-更简单的原型语法"><span>3. 更简单的原型语法</span></a></h3><p>背景：</p><blockquote><p>前面例子中每添加一个属性和方法就要敲一遍 Person.prototype。为减少不必要的输入，也为了从视觉上更好地封装原型的功能，更常见的做法是用一个包含所有属性和方法的 <strong>对象字面量</strong>来重写整个原型对象。</p></blockquote><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function Person(){</span>
<span class="line">}</span>
<span class="line">Person.prototype = {</span>
<span class="line">    name : &quot;Nicholas&quot;,</span>
<span class="line">    age : 29,</span>
<span class="line">    job: &quot;Software Engineer&quot;,</span>
<span class="line">    sayName : function () {</span>
<span class="line">        alert(this.name);</span>
<span class="line">    }</span>
<span class="line">};</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对象字面量方法 与 上面 原型创建对象的方法的不同之处：</p><ul><li>constructor 属性不再指向 Person 了；</li><li>本质上完全重写了默认的 prototype 对象，因此 constructor 属性也就变成了新对象的 constructor 属性(指向 Object 构造函数)，不再指向 Person 函数。</li><li>尽管 instanceof 操作符还能返回正确的结果，但通过 constructor 已经无法确定对象的类型了。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var friend = new Person();</span>
<span class="line">alert(friend instanceof Object); //true</span>
<span class="line">alert(friend instanceof Person); //true</span>
<span class="line">alert(friend.constructor == Person); //false</span>
<span class="line">alert(friend.constructor == Object); //true</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h5 id="解决方法-手动添加constructor" tabindex="-1"><a class="header-anchor" href="#解决方法-手动添加constructor"><span>解决方法：手动添加constructor</span></a></h5><ul><li>不能直接添加constructor,因为以这种方式重设 constructor 属性会导致它的[[Enumerable]]特性被设置为 true。默认 情况下，原生的 constructor 属性是不可枚举的；</li><li>可以使用 Object.defineProperty()重设构造函数（ES5）</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">//重设构造函数，只适用于 ECMAScript 5 兼容的浏览器 </span>
<span class="line">Object.defineProperty(Person.prototype, &quot;constructor&quot;, {</span>
<span class="line">    enumerable: false,</span>
<span class="line">    value: Person</span>
<span class="line">});</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-原型的动态性" tabindex="-1"><a class="header-anchor" href="#_4-原型的动态性"><span>4. 原型的动态性</span></a></h3><blockquote><p>由于在原型中查找值的过程是一次搜索，因此我们对原型对象所做的任何修改都能够立即从实例上反映出来；</p></blockquote><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var friend = new Person();</span>
<span class="line">Person.prototype.sayHi = function(){</span>
<span class="line">    alert(&quot;hi&quot;);</span>
<span class="line">};</span>
<span class="line">friend.sayHi(); //&quot;hi&quot;(没有问题!)</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>解释说明：</p><ul><li>即使 person 实例是在添加新方法之前创建的，但它仍然可以访问这个新方法。其原因可以归结为实例与原型之间的松散连接关系。</li><li>当我们调用 person.sayHi() 时，首先会在实例中搜索名为 sayHi 的属性，在没找到的情况下，会继续搜索原型。</li></ul><h5 id="如果是重写整个原型对象" tabindex="-1"><a class="header-anchor" href="#如果是重写整个原型对象"><span>如果是重写整个原型对象</span></a></h5><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function Person(){</span>
<span class="line">}</span>
<span class="line">var friend = new Person();</span>
<span class="line">Person.prototype = {</span>
<span class="line">    constructor: Person,</span>
<span class="line">    name : &quot;Nicholas&quot;,</span>
<span class="line">    age : 29,</span>
<span class="line">    job : &quot;Software Engineer&quot;,</span>
<span class="line">    sayName : function () {</span>
<span class="line">        alert(this.name);</span>
<span class="line">    }</span>
<span class="line">};</span>
<span class="line">friend.sayName();   //error</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>见 6-3</p><p>解释说明：</p><ul><li>如果是重写整个原型对象，因为调用构造函数时会为实例添加一个指向最初原型的 [[Prototype]]指针，而把原型修改为另外一个对象就等于切断了构造函数与最初原型之间的联系。 请记住:<strong>实例中的指针仅指向原型，而不指向构造函数。</strong></li><li>重写原型对象切断了现有原型与任何之前已经存在的对象实例之间的联系;它们引用的仍然是最初的原型。</li></ul><h3 id="_5-原生对象的原型" tabindex="-1"><a class="header-anchor" href="#_5-原生对象的原型"><span>5. 原生对象的原型</span></a></h3><blockquote><p>所有原生引用类型(Object、Array、String，等等)都在其构造函数的原型上定义了方法。<br> 例如，在 Array.prototype 中可以找到 sort()方法，而在 String.prototype 中可以找到 substring()方法</p></blockquote><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">alert(typeof Array.prototype.sort); //&quot;function&quot; </span>
<span class="line">alert(typeof String.prototype.substring); //&quot;function&quot;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><p>通过原生对象的原型，不仅可以取得所有默认方法的引用，而且也可以定义新方法。</p></li><li><p>尽管可以这样做，但我们<strong>不推荐</strong>在产品化的程序中<strong>修改原生对象的原型</strong>。如果因某个实现中缺少某个方法，就在原生对象的原型中添加这个方法，那么当在另一个支持该方法的实现中运行代码时，就可能会<strong>导致命名冲突</strong>。而且，这样做也可能会<strong>意外地重写原生方法</strong>。</p></li></ul><h3 id="_6-原型对象的问题" tabindex="-1"><a class="header-anchor" href="#_6-原型对象的问题"><span>6. 原型对象的问题</span></a></h3><h5 id="_1-省略了为构造函数传递初始化参数" tabindex="-1"><a class="header-anchor" href="#_1-省略了为构造函数传递初始化参数"><span>① 省略了为构造函数传递初始化参数</span></a></h5><ul><li>它省略了为构造函数传递初始化参数这一环节，结果所有实例在<strong>默认情况下都将取得相同的属性值</strong>。虽然这会在某种程度上带来一些不方便，但还不是原型的最大问题。</li></ul><h5 id="_2-原型模式的最大问题是由其共享的本性所导致的" tabindex="-1"><a class="header-anchor" href="#_2-原型模式的最大问题是由其共享的本性所导致的"><span>② 原型模式的最大问题是由其<strong>共享的本性</strong>所导致的</span></a></h5><ul><li>原型模式的最大问题是由其<strong>共享的本性</strong>所导致的。</li><li>原型中所有属性是被很多实例共享的，这种共享对于<strong>函数非常合适</strong>。</li><li>对于那些<strong>包含基本值的属性</strong>倒也说得过去，通过在实例上添加一个同名属性，可以隐藏原型中的对应属性。</li><li>然而对于包含<strong>引用类型值的属性</strong>来说，<strong>问题就比较突出</strong>了。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function Person(){</span>
<span class="line">}</span>
<span class="line">Person.prototype = {</span>
<span class="line">    constructor: Person, </span>
<span class="line">    name : &quot;Nicholas&quot;,//基本值的属性</span>
<span class="line">    age : 29, //基本值的属性</span>
<span class="line">    job : &quot;Software Engineer&quot;, //基本值的属性</span>
<span class="line">    friends : [&quot;Shelby&quot;, &quot;Court&quot;], //引用类型的属性</span>
<span class="line">    sayName : function () {  //函数</span>
<span class="line">        alert(this.name);</span>
<span class="line">    }</span>
<span class="line">};</span>
<span class="line">var person1 = new Person();</span>
<span class="line">var person2 = new Person();</span>
<span class="line">person1.friends.push(&quot;Van&quot;);</span>
<span class="line">alert(person1.friends);    //&quot;Shelby,Court,Van&quot;</span>
<span class="line">alert(person2.friends);    //&quot;Shelby,Court,Van&quot;</span>
<span class="line">alert(person1.friends === person2.friends);  //true</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对于包含<strong>引用类型值的属性</strong>来说，问题: person1修改friends，也会影响person2的friends，两者friends指向了同一数组， 可是实例一般都是要有属于自己的全部属性的。而这个问题正是我们很少看到有人单独使用原型模式的原因所在。</p><h2 id="四、组合使用构造函数模式和原型模式-最广泛、认同度最高" tabindex="-1"><a class="header-anchor" href="#四、组合使用构造函数模式和原型模式-最广泛、认同度最高"><span>四、组合使用构造函数模式和原型模式（最广泛、认同度最高）</span></a></h2><ul><li>创建自定义类型的最常见方式：就是组合使用构造函数模式与原型模式。</li><li>构造函数模式用于<strong>定义实例属性</strong>，</li><li>而原型模式用于<strong>定义方法和共享的属性</strong>。</li><li>每个实例都会有自己的一份实例属性的副本， 但同时又共享着对方法的引用，最大限度地节省了内存。</li><li>这种混成模式还支持向构造函数传递参数;</li><li>构造函数和原型模式混成的模式，是目前ES中使用<strong>最广泛、认同度最高</strong>的一种创建自定义类型的方法。也是<strong>定义引用类型的一种默认模式</strong>。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function Person(name, age, job){ //构造函数 </span>
<span class="line">    this.name = name;  //定义实例属性</span>
<span class="line">    this.age = age; //定义实例属性</span>
<span class="line">    this.job = job; //定义实例属性</span>
<span class="line">    this.friends = [&quot;Shelby&quot;, &quot;Court&quot;]; //定义实例属性</span>
<span class="line">}</span>
<span class="line">Person.prototype = { //原型模式</span>
<span class="line">    constructor : Person, </span>
<span class="line">    sayName : function(){ //定义方法</span>
<span class="line">        alert(this.name);</span>
<span class="line">    }</span>
<span class="line">}</span>
<span class="line">var person1 = new Person(&quot;Nicholas&quot;, 29, &quot;Software Engineer&quot;);</span>
<span class="line">var person2 = new Person(&quot;Greg&quot;, 27, &quot;Doctor&quot;);</span>
<span class="line">person1.friends.push(&quot;Van&quot;);</span>
<span class="line">alert(person1.friends);    //&quot;Shelby,Count,Van&quot;</span>
<span class="line">alert(person2.friends);    //&quot;Shelby,Count&quot;</span>
<span class="line">alert(person1.friends === person2.friends); //false  构造函数定义的属性，每个实例都有各自的副本</span>
<span class="line">alert(person1.sayName === person2.sayName); //true   原型模式定义的方法，共享一个方法</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>总结归纳：</p><ul><li>构造函数定义的属性，每个实例都有各自的副本</li><li>原型模式定义的方法和共享的属性，每个实例共享指向同一对象</li></ul><h2 id="五、动态原型模式" tabindex="-1"><a class="header-anchor" href="#五、动态原型模式"><span>五、动态原型模式</span></a></h2><blockquote><p>动态原型模式是针对 组合使用构造函数和原型模式的一个动态处理。 可以通过检查某个应该存在的方法是否有效，来决定是否需要初始化原型。</p></blockquote><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function Person(name, age, job){</span>
<span class="line">    //属性</span>
<span class="line">    this.name = name; </span>
<span class="line">    this.age = age; </span>
<span class="line">    this.job = job;</span>
<span class="line">    //方法</span>
<span class="line">    if (typeof this.sayName != &quot;function&quot;){</span>
<span class="line">        Person.prototype.sayName = function(){</span>
<span class="line">            alert(this.name);</span>
<span class="line">        };</span>
<span class="line">    }</span>
<span class="line">}</span>
<span class="line">var friend = new Person(&quot;Nicholas&quot;, 29, &quot;Software Engineer&quot;);</span>
<span class="line">friend.sayName();</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>解释说明：</p><ul><li>只在 sayName()方法不存在的情况下，才会将它添加到原型中。</li><li>if 语句检查的可以是初始化之后应该存在的任何属性或方法——不必用一大堆 if 语句检查每个属性和每个方法;只要检查其中一个即可。</li><li>使用动态原型模式时，不能使用对象字面量重写原型。前面已经解释过了，如果 在已经创建了实例的情况下<strong>重写原型，那么就会切断现有实例与新原型之间的联系</strong>。</li></ul><h2 id="六、寄生构造函数模式" tabindex="-1"><a class="header-anchor" href="#六、寄生构造函数模式"><span>六、寄生构造函数模式</span></a></h2><blockquote><p>基本思想是创建一个函数，该函数的作用仅仅是封装创建对象的代码，然后再返回新创建的对象;但从表面上看，这个函数又很像是典型的构造函数。</p></blockquote><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function Person(name, age, job){</span>
<span class="line">    var o = new Object();</span>
<span class="line">    o.name = name;</span>
<span class="line">    o.age = age;</span>
<span class="line">    o.job = job;</span>
<span class="line">    o.sayName = function(){</span>
<span class="line">        alert(this.name);</span>
<span class="line">    };</span>
<span class="line">    return o; </span>
<span class="line">}</span>
<span class="line">var friend = new Person(&quot;Nicholas&quot;, 29, &quot;Software Engineer&quot;);</span>
<span class="line">friend.sayName();  //&quot;Nicholas&quot;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>说明：</p><ul><li>首先，返回的对象与构造函数或者与构造函数的原型属性之间没有关系;</li><li>问题：为此，<strong>不能依赖 instanceof 操作符来确定对象类型</strong>。由于存在上述问题，我们建议在可以使用其他模式的情况下，不要使用这种模式。</li></ul><h2 id="七、稳妥构造函数模式" tabindex="-1"><a class="header-anchor" href="#七、稳妥构造函数模式"><span>七、稳妥构造函数模式</span></a></h2><blockquote><p>所谓稳妥对象，指的是没有公共属性，而且其方法也不引用 this 的对象。稳妥对象最适合在 一些安全的环境中(这些环境中会禁止使用 this 和 new)，或者在防止数据被其他应用程序(如 Mashup 程序)改动时使用。</p></blockquote><p>稳妥构造函数遵循与寄生构造函数类似的模式，但有两点不同:</p><ul><li>一是新创建对象的 实例方法不引用 this;</li><li>二是不使用 new 操作符调用构造函数</li></ul><p>按照稳妥构造函数的要求，可以将前面 的 Person 构造函数重写如下：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function Person(name, age, job){</span>
<span class="line">    //创建要返回的对象</span>
<span class="line">    var o = new Object();</span>
<span class="line">    //可以在这里定义私有变量和函数</span>
<span class="line">    //添加方法</span>
<span class="line">    o.sayName = function(){</span>
<span class="line">        alert(name);</span>
<span class="line">    };</span>
<span class="line">    //返回对象</span>
<span class="line">    return o; </span>
<span class="line">}</span>
<span class="line">// 不使用 new 操作符调用构造函数</span>
<span class="line">var friend = Person(&quot;Nicholas&quot;, 29, &quot;Software Engineer&quot;); </span>
<span class="line">friend.sayName();  //&quot;Nicholas&quot;</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>说明：</p><ul><li>变量 friend 中保存的是一个稳妥对象，而除了调用 sayName()方法外，没有别的方式可以访问其数据成员。</li><li>即使有其他代码会给这个对象添加方法或数据成员，但也不可能有别的办法访问传 入到构造函数中的原始数据。稳妥构造函数模式提供的这种安全性，使得它非常适合在某些安全执行环境</li><li>问题：与寄生构造函数模式类似，使用稳妥构造函数模式创建的对象与构造函数之间也没有什么关系，因此 instanceof 操作符对这种对象也没有意义。第6章1.面向对象的程序设计之创建对象</li></ul>`,133)])])}const o=s(l,[["render",r]]),c=JSON.parse('{"path":"/fontend/class1/08.create-object.html","title":"面向对象的程序之创建对象","lang":"zh-CN","frontmatter":{},"git":{"updatedTime":1764128360000,"contributors":[{"name":"lumi","username":"lumi","email":"lumiya1228@gmail.com","commits":1,"url":"https://github.com/lumi"}],"changelog":[{"hash":"cf2f85e78da6745fae651d3e778926f1ac985f47","time":1764128360000,"email":"lumiya1228@gmail.com","author":"lumi","message":"docs: restructure front-end and offer sections, add new content and navigation links"}]},"filePathRelative":"fontend/class1/08.create-object.md"}');export{o as comp,c as data};
