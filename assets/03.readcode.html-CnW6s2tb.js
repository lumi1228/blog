import{_ as n,a,d as e,g as i}from"./app-BXqgnaz2.js";const l={};function r(c,s){return i(),a("div",null,[...s[0]||(s[0]=[e(`<blockquote><p><a href="https://www.mianshipai.com/docs/written-exam/JS-reading.html" target="_blank" rel="noopener noreferrer">参考：JS读代码-SY</a></p></blockquote><h2 id="js-编译" tabindex="-1"><a class="header-anchor" href="#js-编译"><span>JS 编译</span></a></h2><h4 id="_1、编译「变量提升、函数与变量声明优先级」" tabindex="-1"><a class="header-anchor" href="#_1、编译「变量提升、函数与变量声明优先级」"><span>1、编译「变量提升、函数与变量声明优先级」</span></a></h4><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">var func = 1</span>
<span class="line">function func() {}</span>
<span class="line">console.log(func + func)</span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><details><summary>结果&amp;分析</summary><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">结果：2</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>编译阶段（提升发生） ：</p><ul><li>JavaScript 引擎在代码执行前会进行编译，此时会将 function func() {} 函数声明提升到当前作用域的顶部</li><li>同时也会将 var func 变量声明提升到作用域顶部，但 变量初始化（赋值为1）会留在原地</li><li>当函数声明和同名变量声明同时存在时， 函数声明的优先级高于变量声明</li></ul><p>执行阶段 ：</p><ul><li>首先执行 var func = 1 ，这会将之前提升的函数引用覆盖为数值 1</li><li>然后执行 function func() {} ，但由于变量已经被赋值，这个函数声明在执行阶段不会生效</li><li>最后执行 console.log(func + func) ，此时 func 的值是 1，所以 1 + 1 = 2</li></ul></details><h2 id="js-类型" tabindex="-1"><a class="header-anchor" href="#js-类型"><span>JS 类型</span></a></h2><h2 id="js-this" tabindex="-1"><a class="header-anchor" href="#js-this"><span>JS this</span></a></h2><h2 id="js-自由变量" tabindex="-1"><a class="header-anchor" href="#js-自由变量"><span>JS 自由变量</span></a></h2><h2 id="js-闭包" tabindex="-1"><a class="header-anchor" href="#js-闭包"><span>JS 闭包</span></a></h2><h2 id="js-promise" tabindex="-1"><a class="header-anchor" href="#js-promise"><span>JS promise</span></a></h2><h2 id="promise执行顺序1「小米1」" tabindex="-1"><a class="header-anchor" href="#promise执行顺序1「小米1」"><span>Promise执行顺序1「小米1」</span></a></h2><details><summary>Promise执行顺序「同步-异步（微任务-宏任务）</summary><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">async function async1() {</span>
<span class="line">    console.log(&#39;async1 start&#39;); //2</span>
<span class="line">    await async2();</span>
<span class="line">    console.log(&#39;async1 end&#39;);//6</span>
<span class="line">  }</span>
<span class="line">  async function async2() {</span>
<span class="line">    console.log(&#39;async2&#39;); //3</span>
<span class="line">  }</span>
<span class="line">  </span>
<span class="line">  console.log(&#39;script start&#39;); //1</span>
<span class="line">  </span>
<span class="line">  setTimeout(function () {</span>
<span class="line">    console.log(&#39;setTimeout&#39;);//8</span>
<span class="line">  }, 0);</span>
<span class="line">  </span>
<span class="line">  async1();</span>
<span class="line">  </span>
<span class="line">  new Promise(function (resolve) {</span>
<span class="line">    console.log(&#39;promise1&#39;); //4</span>
<span class="line">    resolve();</span>
<span class="line">  }).then(function () {</span>
<span class="line">    console.log(&#39;promise2&#39;);//7</span>
<span class="line">  });</span>
<span class="line">  console.log(&#39;script end&#39;); //5</span>
<span class="line"></span>
<span class="line"></span>
<span class="line"></span>
<span class="line">// 执行结果：</span>
<span class="line"></span>
<span class="line">//   promise.js:10 script start</span>
<span class="line">//   promise.js:2 async1 start</span>
<span class="line">//   promise.js:7 async2</span>
<span class="line">//   promise.js:19 promise1</span>
<span class="line">//   promise.js:24 script end</span>
<span class="line">//   promise.js:4 async1 end</span>
<span class="line">//   promise.js:22 promise2</span>
<span class="line">//   promise.js:13 setTimeout</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>JavaScript的事件循环遵循以下优先级：</p><blockquote><p>1.首先执行所有同步代码 （执行栈）<br> 2.然后执行所有微任务 （Microtasks Queue）<br> 3. 最后执行宏任务 （Macrotasks Queue）</p></blockquote><p>逐行解析执行过程:</p><ul><li>script start （行10）：执行全局同步代码的第一条输出</li><li>async1 start （行2）：调用async1()函数，执行其内部的同步代码</li><li><em>async2 （行7）：async1内部调用async2()，执行其同步代码 promise1 （行19）：创建Promise对象，执行其构造</em> 函数中的同步代码</li><li>script end （行24）：执行全局最后一条同步代码 此时同步代码执行完毕，开始执行微任务队列：</li><li>async1 end （行4）：async2()返回的Promise完成后，执行async1中await后面的代码</li><li>promise2 （行22）：Promise构造函数中的resolve()触发then回调，作为微任务执行</li><li>微任务队列清空后，开始执行宏任务队列：</li><li>setTimeout （行13）：执行setTimeout的回调函数</li></ul></details><hr><p>执行顺序？？ // 1、-------------------- // 「百度1」 const obj = {a: 1} obj.a = 2 const arr =[1,2] arr =[] //报错 Uncaught TypeError: Assignment to constant variable.</p><p>// 注意：obj.a=2是允许的，因为只是修改对象的属性而不是重新赋值整个变量 // arr =[] 仍然不允许，因为const变量不能被重新赋值</p><hr><p>function A() {} var a = new A() console.log(a.<strong>proto</strong> === A.prototype) //true console.log(a.prototype) //undefined console.log(A.<strong>proto</strong> === Function.prototype) //true</p><p>// 1、分析 console.log(a.<strong>proto</strong> === A.prototype) //true // - 当使用 new A() 创建对象时，JavaScript会将新创建的对象 a 的内部 [[Prototype]] （在浏览器中通过 <strong>proto</strong> 访问）指向构造函数 A 的 prototype 属性。 // - 这是JavaScript原型继承机制的核心：实例对象通过 <strong>proto</strong> 链接到其构造函数的原型对象。</p><p>// 2、分析 console.log(a.prototype) //undefined // - prototype 属性 只存在于函数对象 上，用于存储将被所有实例共享的属性和方法。 // - a 是通过 new A() 创建的普通实例对象，不是函数，因此它没有 prototype 属性。</p><p>// 3、分析 console.log(A.<strong>proto</strong> === Function.prototype) //true // - 在JavaScript中， 函数本身也是对象 。当创建函数 A 时，它会被视为 Function 的实例。 // - 因此， A 的内部 [[Prototype]] （即 A.<strong>proto</strong> ）会指向 Function.prototype ，这体现了JavaScript中函数的原型链结构。</p>`,20)])])}const t=n(l,[["render",r]]),p=JSON.parse('{"path":"/offer/class0/03.readcode.html","title":"","lang":"zh-CN","frontmatter":{},"git":{"updatedTime":1764689316000,"contributors":[{"name":"lumi","username":"lumi","email":"lumiya1228@gmail.com","commits":1,"url":"https://github.com/lumi"}],"changelog":[{"hash":"f1f63c9ad884d46b7e9931fdd323a8e720f496c8","time":1764689316000,"email":"lumiya1228@gmail.com","author":"lumi","message":"docs: uadd new content for interview preparation and front-end topics"}]},"filePathRelative":"offer/class0/03.readcode.md"}');export{t as comp,p as data};
