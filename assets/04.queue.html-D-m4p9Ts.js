import{_ as s,a as n,d as a,g as i}from"./app-BXqgnaz2.js";const l={};function r(c,e){return i(),n("div",null,[...e[0]||(e[0]=[a(`<h3 id="_1-什么是队列" tabindex="-1"><a class="header-anchor" href="#_1-什么是队列"><span>1. 什么是队列</span></a></h3><ul><li>一个先进先出的数据结构 （enqueue 入栈 dequeue出栈）</li><li>javascript 没有队列，Array实现队列的所有功能；</li><li>队列常用操作：push、shift、queue[0]</li><li>队列【逻辑结构 vs 物理结构】： <ul><li>队列，逻辑结构。抽象模型</li><li>简单的可以用数组、链表表示；复杂的需要单独设计</li></ul></li></ul><h3 id="_2-前端与队列" tabindex="-1"><a class="header-anchor" href="#_2-前端与队列"><span>2. 前端与队列</span></a></h3><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">// queue文件</span>
<span class="line">const queue=[]</span>
<span class="line">//入栈</span>
<span class="line">queue.push(1)</span>
<span class="line">queue.push(2)</span>
<span class="line">queue.push(3)</span>
<span class="line">// 出栈</span>
<span class="line">//shift  移除数组的第一个元素并返回</span>
<span class="line">const item1=queue.shift() </span>
<span class="line">const item2=queue.shift()</span>
<span class="line">const item3=queue.shift()</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-应用场景-先进先出的场景" tabindex="-1"><a class="header-anchor" href="#_3-应用场景-先进先出的场景"><span>3.应用场景（先进先出的场景）</span></a></h3><ul><li>JS异步任务队列</li></ul><blockquote><p>JS是单线程的，无法同时处理异步中的并发任务 使用队列先后处理异步队列</p></blockquote><ul><li>计算最近请求次数</li></ul><blockquote><p>有新请求就入队，3000ms前发出的请求出队 队列的长度就是最近请求次数</p></blockquote><ul><li>请用 ES6 的 class，封装一个 Queue 类，包括 push、shift、peek 方法。</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">class Stack{</span>
<span class="line">  constructor(arr=[]){</span>
<span class="line">    this.arr=arr</span>
<span class="line">  }</span>
<span class="line">  push(item){</span>
<span class="line">    this.arr.push(item)</span>
<span class="line">  }</span>
<span class="line">  shift(){</span>
<span class="line">    return this.arr.shift()</span>
<span class="line">  }</span>
<span class="line">  peek(item){</span>
<span class="line">    return this.arr[0]</span>
<span class="line">  }</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_4-算法题" tabindex="-1"><a class="header-anchor" href="#_4-算法题"><span>4.算法题</span></a></h4><ul><li><a href="https://leetcode-cn.com/problems/implement-stack-using-queues/" target="_blank" rel="noopener noreferrer">225. 用队列实现栈-字节/腾讯 🌟🌟🌟</a></li><li><a href="https://leetcode-cn.com/problems/number-of-recent-calls/" target="_blank" rel="noopener noreferrer">933. 最近的请求次数[Mooc]</a></li><li><a href="https://leetcode-cn.com/problems/first-unique-character-in-a-string/" target="_blank" rel="noopener noreferrer">387. 字符串中的第一个唯一字符-哈希表/</a> [<a href="https://leetcode-cn.com/problems/di-yi-ge-zhi-chu-xian-yi-ci-de-zi-fu-lcof/" target="_blank" rel="noopener noreferrer">同剑指50</a>]</li></ul>`,13)])])}const u=s(l,[["render",r]]),d=JSON.parse('{"path":"/fontend/class2/04.queue.html","title":"","lang":"zh-CN","frontmatter":{},"git":{"updatedTime":1764157357000,"contributors":[{"name":"lumi","username":"lumi","email":"lumiya1228@gmail.com","commits":1,"url":"https://github.com/lumi"}],"changelog":[{"hash":"1860e17827d3aabac151c579edaf9fdcd3a988c3","time":1764157357000,"email":"lumiya1228@gmail.com","author":"lumi","message":"docs: expand front-end class2 section with new topics on data structures and algorithms"}]},"filePathRelative":"fontend/class2/04.queue.md"}');export{u as comp,d as data};
