import{_ as s,a,d as e,g as i}from"./app-BXqgnaz2.js";const l={};function r(c,n){return i(),a("div",null,[...n[0]||(n[0]=[e(`<h3 id="_1、手写深拷贝" tabindex="-1"><a class="header-anchor" href="#_1、手写深拷贝"><span>1、手写深拷贝</span></a></h3><p><a href="https://segmentfault.com/a/1190000016672263" target="_blank" rel="noopener noreferrer">参考：深拷贝的终极探索（99%的人都不知道）</a> + SY 💛💛</p><details><summary>1-手写递归方法</summary><blockquote><p>深拷贝会另外拷贝一份一个一样的对象, 但是不同的是会从堆内存中开辟一个新的区域存放新对象, 新对象跟原对象不再共享内存，修改赋值后的对象b不会改到原对象a。</p></blockquote><blockquote><p>思路： 1.判断是否是对象类型，不是则直接返回 2.初始化类型：数组或对象 3.保证key不是原型的属性 4.递归调用返回值</p></blockquote><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">/**</span>
<span class="line"> * 深拷贝</span>
<span class="line"> * @param {Object} obj 要拷贝对象</span>
<span class="line"> */</span>
<span class="line">function deepClone(obj) {</span>
<span class="line">    if (!(obj instanceof Object)) return obj;</span>
<span class="line">    let res</span>
<span class="line">     //初始化返回结果</span>
<span class="line">    if (obj instanceof Array) {</span>
<span class="line">        res=[]</span>
<span class="line">    }else{</span>
<span class="line">        res={}</span>
<span class="line">    }</span>
<span class="line">    for (let key in obj) {</span>
<span class="line">        if (Object.hasOwnProperty.call(obj, key)) {</span>
<span class="line">            // 保证key不是原型的属性</span>
<span class="line">            res[key]=deepClone(obj[key])//递归调用！！</span>
<span class="line">        }</span>
<span class="line">    }</span>
<span class="line">    return res //返回结果</span>
<span class="line">}    </span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><details><summary> 2-使用JSON.parse(JSON.stringify()) </summary><p>实现原理： 用JSON.stringify将JSON对象转成JSON字符串， 再用JSON.parse()把字符串解析成对象，一去一来，新的对象产生了，而且对象会开辟新的栈，实现深拷贝。</p><p>缺点： 由于用到了JSON.stringify()，这也会导致一系列的问题，因为要严格遵守JSON序列化规则：</p><ul><li>如果含有<strong>Date对象</strong>，JSON.stringify()会将其变为字符串，<strong>之后并不会将其还原为日期对象</strong>。</li><li>或是含有<strong>RegExp对象</strong>，JSON.stringify()会将其变为<strong>空对象</strong></li><li>属性中含有<strong>NaN、Infinity和-Infinity</strong>，则序列化的结果会变成<strong>null</strong></li><li>如果属性中有<strong>函数,undefined,symbol</strong>则经过JSON.stringify()序列化后的JSON字符串中这个<strong>键值对会消失</strong>，因为不支持。</li></ul></details><h3 id="_2、数组去重「京喜、易车」" tabindex="-1"><a class="header-anchor" href="#_2、数组去重「京喜、易车」"><span>2、数组去重「京喜、易车」</span></a></h3><p><a href="https://github.com/mqyqingfeng/Blog/issues/27" target="_blank" rel="noopener noreferrer">参考：JavaScript专题之数据库去重</a> + SY 💛💛</p><p>前置知识：</p><blockquote><p>indexOf()方法可返回某个指定的元素在数组中首次出现的位置。 Array.prototype.filter()方法：创建一个新数组, 其包含通过所提供函数实现的测试的所有元素。 Array.prototype.sort() 方法：对数组的元素进行排序，并返回数组。默认排序顺序是在将元素转换为字符串，然后比较它们的UTF-16代码单元值序列时构建的 Set：ES6新增的数据结构，它类似于数组，但是成员的值都是唯一的，没有重复的值。 Array.from()：方法从一个类似数组或可迭代对象创建一个新的，浅拷贝的数组实例。</p></blockquote><details><summary>1.双for循环==for循环+indexOf</summary><ul><li>定义新数组(结果数组)；</li><li>遍历原始数组，将原始数组中的每个元素与新数组中的每个元素进行比对；</li><li>如果不重复则添加到新数组中返回。</li><li>时间复杂度是O(n^2)</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function noRepeat(arr){</span>
<span class="line">if (!Array.isArray(arr)) return &#39;非数组的数据&#39;;</span>
<span class="line">let result=[arr[0]];// 初始化第一个数据</span>
<span class="line">for (let i = 1; i &lt; arr.length; i++) { // 从第二个元素开始判断</span>
<span class="line">    var flag=true//默认 没有重复值</span>
<span class="line">    for (let j = 0; j &lt; result.length; j++) {</span>
<span class="line">        if(arr[i] === result[j]){</span>
<span class="line">            flag=false; //一旦有重复值就修改为 false,不可传入新数组</span>
<span class="line">            break;//跳出内层循环</span>
<span class="line">        }</span>
<span class="line">    }</span>
<span class="line">    if(flag){</span>
<span class="line">        result.push(arr[i])</span>
<span class="line">    }</span>
<span class="line">}</span>
<span class="line">return result;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>等价于</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function noRepeat(arr){</span>
<span class="line">    if (!Array.isArray(arr)) return &#39;非数组的数据&#39;;</span>
<span class="line">    let result=[];// 初始化第一个数据</span>
<span class="line">    for (let i = 0; i &lt; arr.length; i++) { // 从第二个元素开始判断</span>
<span class="line">        if(result.indexOf(arr[i]) === -1){</span>
<span class="line">            result.push(arr[i])</span>
<span class="line">        }</span>
<span class="line">    }</span>
<span class="line">    return result;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><details><summary>2.Array.filter()+indexOf()</summary><ul><li>利用indexOf检测元素在数组中第一次出现的位置是否和元素现在的位置相等</li><li>若不相等则为重复元素，故只剪出相等即可包含所有非重复元素</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function noRepeat(arr){</span>
<span class="line">    if (!Array.isArray(arr)) return &#39;非数组的数据&#39;;</span>
<span class="line">    return arr.filter((item,index)=&gt;{</span>
<span class="line">        return arr.indexOf(item) ===index;</span>
<span class="line">    })</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><details><summary>3.Array.sort()+相邻元素去重</summary><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function noRepeat(arr){</span>
<span class="line">    if (!Array.isArray(arr)) return &#39;非数组的数据&#39;;</span>
<span class="line">    let arr2= arr.sort()</span>
<span class="line">    let result=[]</span>
<span class="line">    for (let i = 0; i &lt; arr2.length; i++) {</span>
<span class="line">        if(arr2[i] !== arr2[i+1]){</span>
<span class="line">            result.push(arr2[i])</span>
<span class="line">        }</span>
<span class="line">    }</span>
<span class="line">    return result;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><details><summary>4.利用对象属性去重</summary><ul><li>将数组中的值设为对象的属性，并给该属性赋初始值1，</li><li>若非重复数据可以获得无该属性，则收集。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function noRepeat(arr){</span>
<span class="line">    if (!Array.isArray(arr)) return &#39;非数组的数据&#39;;</span>
<span class="line">    let obj={}</span>
<span class="line">    let result=[]</span>
<span class="line">    for (let i = 0; i &lt; arr.length; i++) {</span>
<span class="line">        if(!obj[arr[i]]){</span>
<span class="line">            obj[arr[i]]=1;</span>
<span class="line">            result.push(arr[i])</span>
<span class="line">        }</span>
<span class="line">    }</span>
<span class="line">    return result;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><details><summary>5.new Set去重+rest不定参数+解构赋值</summary><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function noRepeat(arr){</span>
<span class="line">    if (!Array.isArray(arr)) return &#39;非数组的数据&#39;;</span>
<span class="line">    return [...new Set(arr)] ;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><details><summary>6.new Set去重+Array.from</summary><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function noRepeat(arr){</span>
<span class="line">    if (!Array.isArray(arr)) return &#39;非数组的数据&#39;;</span>
<span class="line">    return Array.from(new Set(arr)) ;</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><h3 id="_3、手写-gettype-instanceof函数" tabindex="-1"><a class="header-anchor" href="#_3、手写-gettype-instanceof函数"><span>3、手写 getType &amp; instanceof函数</span></a></h3><details><summary>1-getType「SY」</summary><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function getType(data) {</span>
<span class="line">  // 获取到 &quot;[object Type]&quot;，其中 Type 是 Null、Undefined、Array、Function、Error、Boolean、Number、String、Date、RegExp 等。</span>
<span class="line">  const originType = Object.prototype.toString.call(data)</span>
<span class="line">  // 可以直接截取第8位和倒数第一位，这样就获得了 Null、Undefined、Array、Function、Error、Boolean、Number、String、Date、RegExp 等</span>
<span class="line">  const type = originType.slice(8, -1)</span>
<span class="line">  // 再转小写，得到 null、undefined、array、function 等</span>
<span class="line">  return type.toLowerCase()</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><details><summary>2-instanceof「自己手写」</summary><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function instanceof1(left, right) {</span>
<span class="line">    if (typeof left !== &quot;object&quot; &amp;&amp; typeof left !== &quot;function&quot;) {</span>
<span class="line">        return &quot;非引用类型&quot;</span>
<span class="line">    }</span>
<span class="line">    var L = left.__proto__//取L的隐式原型</span>
<span class="line">    var R = right.prototype//取R的显式原型</span>
<span class="line"></span>
<span class="line">    while (R != null) {</span>
<span class="line">        console.log(&#39;r&#39;,R )</span>
<span class="line">        if(L === R){ </span>
<span class="line">            return true;</span>
<span class="line">        }</span>
<span class="line">        L=L.__proto__</span>
<span class="line">    }</span>
<span class="line">}</span>
<span class="line">let arr = [1, 2]</span>
<span class="line">console.log(instanceof1(arr, Array)) //true</span>
<span class="line">console.log(instanceof1(arr, Object)) //true</span>
<span class="line">        </span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><h3 id="_4、手写-class-继承" tabindex="-1"><a class="header-anchor" href="#_4、手写-class-继承"><span>4、手写 class 继承</span></a></h3><p><a href="https://github.com/mqyqingfeng/Blog/issues/27" target="_blank" rel="noopener noreferrer">参考：JavaScript专题之数据库去重</a> + SY 💛💛</p><details><summary> 手写 class 继承</summary><p>在某网页中，有三种菜单：button menu，select menu，modal menu。</p><p>他们的共同特点：</p><p>都有 title icon 属性 都有 isDisabled 方法（可直接返回 false） 都有 exec 方法，执行菜单的逻辑 他们的不同点：</p><p>button menu，执行 exec 时打印 &#39;hello&#39; select menu，执行 exec 时返回一个数组 [&#39;item1&#39;, &#39;item2&#39;, &#39;item3&#39;] modal menu，执行 exec 时返回一个 DOM Element <div>modal</div> 请用 ES6 语法写出这三种菜单的 class</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">class BaseMenu {</span>
<span class="line">  constructor(title, icon) {</span>
<span class="line">    this.title = title</span>
<span class="line">    this.icon = icon</span>
<span class="line">  }</span>
<span class="line">  isDisabled() {</span>
<span class="line">    return false</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">class ButtonMenu extends BaseMenu {</span>
<span class="line">  constructor(title, icon) {</span>
<span class="line">    super(title, icon)</span>
<span class="line">  }</span>
<span class="line">  exec() {</span>
<span class="line">    console.log(&#39;hello&#39;)</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">class SelectMenu extends BaseMenu {</span>
<span class="line">  constructor(title, icon) {</span>
<span class="line">    super(title, icon)</span>
<span class="line">  }</span>
<span class="line">  exec() {</span>
<span class="line">    return [&#39;item1&#39;, &#39;item2&#39;, &#39;item3&#39;]</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">class ModalMenu extends BaseMenu {</span>
<span class="line">  constructor(title, icon) {</span>
<span class="line">    super(title, icon)</span>
<span class="line">  }</span>
<span class="line">  exec() {</span>
<span class="line">    const div = document.createElement(&#39;div&#39;)</span>
<span class="line">    div.innerText = &#39;modal&#39;</span>
<span class="line">    return div</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><h3 id="_5、手写防抖-debounce-「百度1、易车1」" tabindex="-1"><a class="header-anchor" href="#_5、手写防抖-debounce-「百度1、易车1」"><span>5、手写防抖 Debounce 「百度1、易车1」</span></a></h3><p><a href="https://github.com/mqyqingfeng/Blog/issues/22" target="_blank" rel="noopener noreferrer">参考：JavaScript专题之跟着underscore学防抖</a> + SY 💛💛</p><details><summary>手写Debounce方法</summary><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function debounce(func, wait, immediate) {</span>
<span class="line">  var timeout, result</span>
<span class="line"></span>
<span class="line">  var debounced = function () {</span>
<span class="line">    var context = this</span>
<span class="line">    var args = arguments</span>
<span class="line"></span>
<span class="line">    if (timeout) clearTimeout(timeout)</span>
<span class="line">    if (immediate) {</span>
<span class="line">      // 如果已经执行过，不再执行</span>
<span class="line">      var callNow = !timeout</span>
<span class="line">      timeout = setTimeout(function () {</span>
<span class="line">        timeout = null</span>
<span class="line">      }, wait)</span>
<span class="line">      if (callNow) result = func.apply(context, args)</span>
<span class="line">    } else {</span>
<span class="line">      timeout = setTimeout(function () {</span>
<span class="line">        func.apply(context, args)</span>
<span class="line">      }, wait)</span>
<span class="line">    }</span>
<span class="line">    return result</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  debounced.cancel = function () {</span>
<span class="line">    clearTimeout(timeout)</span>
<span class="line">    timeout = null</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  return debounced</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><h3 id="_6、手写截流-throttle「百度1、易车1」" tabindex="-1"><a class="header-anchor" href="#_6、手写截流-throttle「百度1、易车1」"><span>6、手写截流 Throttle「百度1、易车1」</span></a></h3><p><a href="https://github.com/mqyqingfeng/Blog/issues/26" target="_blank" rel="noopener noreferrer">参考：JavaScript专题之跟着 underscore 学节流</a> + SY 💛💛</p><details><summary>手写throttle方法</summary><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">  function throttle(func, wait, options) {</span>
<span class="line">  var timeout, context, args, result</span>
<span class="line">  var previous = 0</span>
<span class="line">  if (!options) options = {}</span>
<span class="line"></span>
<span class="line">  var later = function () {</span>
<span class="line">    previous = options.leading === false ? 0 : new Date().getTime()</span>
<span class="line">    timeout = null</span>
<span class="line">    func.apply(context, args)</span>
<span class="line">    if (!timeout) context = args = null</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  var throttled = function () {</span>
<span class="line">    var now = new Date().getTime()</span>
<span class="line">    if (!previous &amp;&amp; options.leading === false) previous = now</span>
<span class="line">    var remaining = wait - (now - previous)</span>
<span class="line">    context = this</span>
<span class="line">    args = arguments</span>
<span class="line">    if (remaining &lt;= 0 || remaining &gt; wait) {</span>
<span class="line">      if (timeout) {</span>
<span class="line">        clearTimeout(timeout)</span>
<span class="line">        timeout = null</span>
<span class="line">      }</span>
<span class="line">      previous = now</span>
<span class="line">      func.apply(context, args)</span>
<span class="line">      if (!timeout) context = args = null</span>
<span class="line">    } else if (!timeout &amp;&amp; options.trailing !== false) {</span>
<span class="line">      timeout = setTimeout(later, remaining)</span>
<span class="line">    }</span>
<span class="line">  }</span>
<span class="line">  throttled.cancel = function () {</span>
<span class="line">    clearTimeout(timeout)</span>
<span class="line">    previous = 0</span>
<span class="line">    timeout = null</span>
<span class="line">  }</span>
<span class="line">  return throttled</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><h3 id="_7、手写-bind" tabindex="-1"><a class="header-anchor" href="#_7、手写-bind"><span>7、手写 bind</span></a></h3><p><a href="https://github.com/mqyqingfeng/Blog/issues/12" target="_blank" rel="noopener noreferrer">参考：JavaScript深入之bind的模拟实现</a> + SY 💛💛</p><details><summary>call、apply、bind的基本使用</summary><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">let obj = {</span>
<span class="line">    a: &#39;李&#39;</span>
<span class="line">}</span>
<span class="line">function allName(b) {</span>
<span class="line">    console.log(this) //{a: &quot;李&quot;}</span>
<span class="line">    return this.a + b;</span>
<span class="line">}</span>
<span class="line">console.log(allName.call(obj, &#39;四&#39;)) // 李四</span>
<span class="line"></span>
<span class="line">console.log(allName.apply(obj, [&#39;二&#39;])) // 李二</span>
<span class="line"></span>
<span class="line">var fn = allName.bind(obj, &#39;三&#39;)</span>
<span class="line">console.log(fn()) // 李三     </span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><details><summary>1、手写bind方法「SY」</summary><ul><li>function.bind(thisArg[, arg1[, arg2[, ...]]])</li></ul><blockquote><p>[MDN] bind() 方法创建一个新的函数，<br> 在 bind() 被调用时，这个新函数的 this 被指定为 bind() 的第一个参数，<br> 而其余参数将作为新函数的参数，供调用时使用。</p></blockquote><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">Function.prototype.bind2 = function (context) {</span>
<span class="line">  if (typeof this !== &#39;function&#39;) {</span>
<span class="line">    throw new Error(&#39;Function.prototype.bind - what is trying to be bound is not callable&#39;)</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  var self = this</span>
<span class="line">  var args = Array.prototype.slice.call(arguments, 1)</span>
<span class="line"></span>
<span class="line">  var fNOP = function () {}</span>
<span class="line"></span>
<span class="line">  var fBound = function () {</span>
<span class="line">    var bindArgs = Array.prototype.slice.call(arguments)</span>
<span class="line">    return self.apply(this instanceof fNOP ? this : context, args.concat(bindArgs))</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  fNOP.prototype = this.prototype</span>
<span class="line">  fBound.prototype = new fNOP()</span>
<span class="line">  return fBound</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><details><summary>2、bind方法「Own整理」</summary><p>理解bind函数:</p><blockquote><p>bind方法主要的作用是将<strong>函数绑定至某个对象</strong>，当函数f()上调用bind()方法并传入对象o作为参数，这个方法将<strong>返回一个新的函数</strong>。</p></blockquote><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function f(y){return this.x+y} // step1.定义函数</span>
<span class="line">var o={x:1} //step2.定义待传入的对象</span>
<span class="line">var g=f.bind(o)//step3.f函数绑定至o对象, 返回一个新对象赋值给g</span>
<span class="line">g(2) //3</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>思路步骤：</p><ol><li>在Function原型上定义方法bind1</li><li>将参数拆解为数组</li><li>获取this(数组第一项)、及函数传参</li><li>获取上下文(this):fn1.bind(...)中的fn1,存储为self</li><li>返回一个函数，函数内用self.apply实现函数的绑定</li></ol><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">// step0:在Function原型上定义方法bind1</span>
<span class="line">Function.prototype.bind1=function(){</span>
<span class="line">    // arguments:可以获取函数所有的参数</span>
<span class="line">    console.log(arguments) //[{x: 100},10,20]</span>
<span class="line">    // slice() 方法可从已有的数组中返回选定的元素。</span>
<span class="line">    // step1:将参数拆解为数组</span>
<span class="line">    </span>
<span class="line">    const args = Array.prototype.slice.call(arguments)</span>
<span class="line"></span>
<span class="line">    // step2:获取this(数组第一项)</span>
<span class="line">    const this_ = args.shift() //shift() 方法用于把数组的第一个元素从其中删除，并返回第一个元素的值。</span>
<span class="line"></span>
<span class="line">    // 存储 fn1.bind(...)中的fn1</span>
<span class="line">    const self = this //this指向fn1</span>
<span class="line"></span>
<span class="line">    //返回一个函数</span>
<span class="line">    return function(){</span>
<span class="line">        return self.apply(this_, args)</span>
<span class="line">    }</span>
<span class="line">}</span>
<span class="line">const fn3 = fn1.bind1({</span>
<span class="line">    x: 100</span>
<span class="line">}, 10, 20)</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><h3 id="_8、手写-call-和-apply" tabindex="-1"><a class="header-anchor" href="#_8、手写-call-和-apply"><span>8、手写 call 和 apply</span></a></h3><p><a href="https://github.com/mqyqingfeng/Blog/issues/11" target="_blank" rel="noopener noreferrer">参考：JavaScript深入之call和apply的模拟实现</a> + SY 💛💛</p><details><summary>手写手写 call 和 apply方法</summary><ul><li>function.call(thisArg, arg1, arg2, ...)</li></ul><blockquote><p>[MDN] call() 方法使用一个指定的 this 值和单独给出的一个或多个参数来调用一个函数。<br> call() 方法接受的是一个参数列表</p></blockquote><ul><li>func.apply(thisArg, [argsArray])</li></ul><blockquote><p>[MDN] apply() 方法调用一个具有给定this值的函数，以及以一个数组（或类数组对象）的形式提供的参数。<br> apply()方法接受的是一个参数数组。</p></blockquote><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">Function.prototype.call2 = function (context) {</span>
<span class="line">  var context = context || window</span>
<span class="line">  context.fn = this</span>
<span class="line"></span>
<span class="line">  var args = []</span>
<span class="line">  for (var i = 1, len = arguments.length; i &lt; len; i++) {</span>
<span class="line">    args.push(&#39;arguments[&#39; + i + &#39;]&#39;)</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  var result = eval(&#39;context.fn(&#39; + args + &#39;)&#39;)</span>
<span class="line"></span>
<span class="line">  delete context.fn</span>
<span class="line">  return result</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">Function.prototype.apply = function (context, arr) {</span>
<span class="line">  var context = Object(context) || window</span>
<span class="line">  context.fn = this</span>
<span class="line"></span>
<span class="line">  var result</span>
<span class="line">  if (!arr) {</span>
<span class="line">    result = context.fn()</span>
<span class="line">  } else {</span>
<span class="line">    var args = []</span>
<span class="line">    for (var i = 0, len = arr.length; i &lt; len; i++) {</span>
<span class="line">      args.push(&#39;arr[&#39; + i + &#39;]&#39;)</span>
<span class="line">    }</span>
<span class="line">    result = eval(&#39;context.fn(&#39; + args + &#39;)&#39;)</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  delete context.fn</span>
<span class="line">  return result</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><h3 id="_9、手写数组拍平-array-flatten" tabindex="-1"><a class="header-anchor" href="#_9、手写数组拍平-array-flatten"><span>9、手写数组拍平 Array Flatten</span></a></h3><p><a href="https://github.com/mqyqingfeng/Blog/issues/36" target="_blank" rel="noopener noreferrer">参考：JavaScript专题之数组扁平化</a> + SY 💛💛</p><details><summary>1- flatten方法「SY」</summary><p>前置知识-Own：</p><p><code>Array.prototype.flat(depth)</code>特性：</p><ul><li><code>Array.prototype.flat()</code>[ES10]：用于将嵌套的数组“拉平”，变成一维的数组。该方法返回一个新数组，对原数据没有影响。</li><li>不传参数时，默认“拉平”一层</li><li>传入一个整数参数，整数即“拉平”的层数</li><li>Infinity关键字作为参数时，无论多少层嵌套，都会转为一维数组</li><li>传入 &lt;=0的整数将返回原数组，不“拉平”</li><li>如果原数组有空位，flat()方法会跳过空位。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function flatten(input, shallow, strict, output) {</span>
<span class="line">  // 递归使用的时候会用到output</span>
<span class="line">  output = output || []</span>
<span class="line">  var idx = output.length</span>
<span class="line"></span>
<span class="line">  for (var i = 0, len = input.length; i &lt; len; i++) {</span>
<span class="line">    var value = input[i]</span>
<span class="line">    // 如果是数组，就进行处理</span>
<span class="line">    if (Array.isArray(value)) {</span>
<span class="line">      // 如果是只扁平一层，遍历该数组，依此填入 output</span>
<span class="line">      if (shallow) {</span>
<span class="line">        var j = 0,</span>
<span class="line">          length = value.length</span>
<span class="line">        while (j &lt; length) output[idx++] = value[j++]</span>
<span class="line">      }</span>
<span class="line">      // 如果是全部扁平就递归，传入已经处理的 output，递归中接着处理 output</span>
<span class="line">      else {</span>
<span class="line">        flatten(value, shallow, strict, output)</span>
<span class="line">        idx = output.length</span>
<span class="line">      }</span>
<span class="line">    }</span>
<span class="line">    // 不是数组，根据 strict 的值判断是跳过不处理还是放入 output</span>
<span class="line">    else if (!strict) {</span>
<span class="line">      output[idx++] = value</span>
<span class="line">    }</span>
<span class="line">  }</span>
<span class="line"></span>
<span class="line">  return output</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><h3 id="_10、手写解析-url-参数为-js-对象" tabindex="-1"><a class="header-anchor" href="#_10、手写解析-url-参数为-js-对象"><span>10、手写解析 URL 参数为 JS 对象</span></a></h3><p><a href="https://juejin.cn/post/6950554221242499103" target="_blank" rel="noopener noreferrer">参考：解析 URL 参数为对象和字符串模板</a> + SY 💛💛</p><details><summary>解析 URL 参数为 JS 对象</summary><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function parseParam(url) {</span>
<span class="line">  const paramsStr = /.+\\?(.+)$/.exec(url)[1] // 将 ? 后面的字符串取出来</span>
<span class="line">  //exec() 方法用于检索字符串中的正则表达式的匹配。</span>
<span class="line">  const paramsArr = paramsStr.split(&#39;&amp;&#39;) // 将字符串以 &amp; 分割后存到数组中</span>
<span class="line">  let paramsObj = {}</span>
<span class="line">  // 将 params 存到对象中</span>
<span class="line">  paramsArr.forEach((param) =&gt; {</span>
<span class="line">    if (/=/.test(param)) {</span>
<span class="line">      // 处理有 value 的参数</span>
<span class="line">      let [key, val] = param.split(&#39;=&#39;) // 分割 key 和 value</span>
<span class="line">      val = decodeURIComponent(val) // 解码</span>
<span class="line">      val = /^\\d+$/.test(val) ? parseFloat(val) : val // 判断是否转为数字</span>
<span class="line">      //test() 方法用于检测一个字符串是否匹配某个模式.</span>
<span class="line">      if (paramsObj.hasOwnProperty(key)) {</span>
<span class="line">        // 如果对象有 key，则添加一个值</span>
<span class="line">        paramsObj[key] = [].concat(paramsObj[key], val)</span>
<span class="line">        //concat() 方法用于连接两个或多个数组。</span>
<span class="line">        //该方法不会改变现有的数组，而仅仅会返回被连接数组的一个副本。</span>
<span class="line">      } else {</span>
<span class="line">        // 如果对象没有这个 key，创建 key 并设置值</span>
<span class="line">        paramsObj[key] = val</span>
<span class="line">      }</span>
<span class="line">    } else {</span>
<span class="line">      // 处理没有 value 的参数</span>
<span class="line">      paramsObj[param] = true</span>
<span class="line">    }</span>
<span class="line">  })</span>
<span class="line"></span>
<span class="line">  return paramsObj</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details>`,40)])])}const p=s(l,[["render",r]]),t=JSON.parse('{"path":"/offer/class0/01.JS-code.html","title":"","lang":"zh-CN","frontmatter":{},"git":{"updatedTime":1764689316000,"contributors":[{"name":"lumi","username":"lumi","email":"lumiya1228@gmail.com","commits":1,"url":"https://github.com/lumi"}],"changelog":[{"hash":"f1f63c9ad884d46b7e9931fdd323a8e720f496c8","time":1764689316000,"email":"lumiya1228@gmail.com","author":"lumi","message":"docs: uadd new content for interview preparation and front-end topics"}]},"filePathRelative":"offer/class0/01.JS-code.md"}');export{p as comp,t as data};
