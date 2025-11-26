import{_ as n,a as s,d as a,g as l}from"./app-DWSbfguz.js";const i="/blog/images/fontend/10t2.png",r={};function c(t,e){return l(),s("div",null,[...e[0]||(e[0]=[a(`<h3 id="_1-什么是栈" tabindex="-1"><a class="header-anchor" href="#_1-什么是栈"><span>1. 什么是栈</span></a></h3><ul><li>一个后进先出的数据结构 （push 入栈 pop出栈）</li><li>javascript 没有栈，Array实现栈的所有功能；</li><li>栈的常用操作：push pop stack<a href="%E6%A0%88%E9%A1%B6">stack.length-1</a></li><li>栈 vs 数组： <ul><li>栈，逻辑结构。理论模型，不受任何语言限制</li><li>数组，物理结构。真实的功能实现，受限于编程语言</li></ul></li></ul><h3 id="_2-前端与栈-js中的函数调用堆栈" tabindex="-1"><a class="header-anchor" href="#_2-前端与栈-js中的函数调用堆栈"><span>2. 前端与栈-JS中的函数调用堆栈</span></a></h3><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">//后进先出特性</span>
<span class="line">const stack =[]</span>
<span class="line">// 入栈</span>
<span class="line">stack.push(1)</span>
<span class="line">stack.push(2)</span>
<span class="line">console.log(stack) //[1,2]</span>
<span class="line">// 出栈</span>
<span class="line">const item1 = stack.pop() //2</span>
<span class="line">const item2 = stack.pop() //1</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-应用场景-后进先出的场景" tabindex="-1"><a class="header-anchor" href="#_3-应用场景-后进先出的场景"><span>3.应用场景（后进先出的场景）</span></a></h3><ul><li>十进制转二进制</li></ul><p><img src="`+i+`" alt="十进制转二进制"></p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function fn(num){</span>
<span class="line">    let res = &#39;&#39;;</span>
<span class="line">    const stack=[]</span>
<span class="line">    while(num){</span>
<span class="line">    num=parseInt(num/2)</span>
<span class="line">    stack.push(num%2)</span>
<span class="line">    }</span>
<span class="line">    while(stack.length){</span>
<span class="line">    res+= stack[stack.length-1] </span>
<span class="line">    }</span>
<span class="line">    return res;</span>
<span class="line">}</span>
<span class="line">fn(20)</span>
<span class="line">// 后出来的余数反而要排到前面</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>判断字符串的括号是否有效</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">// 括号是否可以有效闭合</span>
<span class="line">(((((((()))))))) valid</span>
<span class="line">() () () () valid</span>
<span class="line">(((((((() invalid</span>
<span class="line">((()(()))) valid</span>
<span class="line"></span>
<span class="line">// 越靠后的左括号，对应的右括号越靠前。</span>
<span class="line">// 左括号入栈，右括号出栈，最后栈空了就是合法的</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>函数调用堆栈</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">function greeting(){</span>
<span class="line">    sayHi();</span>
<span class="line">}</span>
<span class="line">function sayHi(){</span>
<span class="line">    return &quot;Hi!&quot;</span>
<span class="line">}</span>
<span class="line">greeting()</span>
<span class="line"></span>
<span class="line">//最后调用的函数是最先执行完的</span>
<span class="line">//Js解释器使用栈来控制函数的调用顺序</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_4-算法题" tabindex="-1"><a class="header-anchor" href="#_4-算法题"><span>4.算法题</span></a></h4><ul><li><a href="https://leetcode-cn.com/problems/valid-parentheses/" target="_blank" rel="noopener noreferrer">20.有限的括号「MC100/HOT100/字节/腾讯」🌟🌟🌟🌟</a></li><li><a href="https://leetcode.cn/problems/binary-tree-preorder-traversal/" target="_blank" rel="noopener noreferrer">leetCode:144.二叉树的前序遍历🌟🌟🌟🌟</a>【栈可以模拟递归改写递归、看完二叉树接口后重新写】</li><li><a href="https://leetcode-cn.com/problems/implement-queue-using-stacks/" target="_blank" rel="noopener noreferrer">232. 用栈实现队列「MC100/字节/腾讯/剑指09」🌟🌟🌟🌟</a> 📌</li><li><a href="https://leetcode-cn.com/problems/cong-wei-dao-tou-da-yin-lian-biao-lcof/" target="_blank" rel="noopener noreferrer">剑指 Offer 06. 从尾到头打印链表（字节/腾讯）</a></li><li><a href="https://leetcode-cn.com/problems/palindrome-linked-list/" target="_blank" rel="noopener noreferrer">234. 回文链表（HOT100/字节/腾讯）</a></li><li><a href="https://leetcode-cn.com/problems/min-stack/" target="_blank" rel="noopener noreferrer">155. 最小栈-HOT100/字节</a></li><li><a href="https://leetcode-cn.com/problems/bao-han-minhan-shu-de-zhan-lcof/" target="_blank" rel="noopener noreferrer">剑指 Offer 30. 包含min函数的栈-字节/腾讯</a></li><li><a href="https://leetcode-cn.com/problems/next-greater-element-i/" target="_blank" rel="noopener noreferrer">496. 下一个更大元素 I</a></li><li><a href="https://leetcode-cn.com/problems/remove-all-adjacent-duplicates-in-string/" target="_blank" rel="noopener noreferrer">1047. 删除字符串中的所有相邻重复项-字节</a></li></ul>`,14)])])}const p=n(r,[["render",c]]),o=JSON.parse('{"path":"/fontend/class2/03.stack.html","title":"","lang":"zh-CN","frontmatter":{},"git":{"updatedTime":1764157357000,"contributors":[{"name":"lumi","username":"lumi","email":"lumiya1228@gmail.com","commits":1,"url":"https://github.com/lumi"}],"changelog":[{"hash":"1860e17827d3aabac151c579edaf9fdcd3a988c3","time":1764157357000,"email":"lumiya1228@gmail.com","author":"lumi","message":"docs: expand front-end class2 section with new topics on data structures and algorithms"}]},"filePathRelative":"fontend/class2/03.stack.md"}');export{p as comp,o as data};
