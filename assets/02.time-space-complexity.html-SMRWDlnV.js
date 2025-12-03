import{_ as s,a as i,d as a,g as l}from"./app-BXqgnaz2.js";const e={};function c(d,n){return l(),i("div",null,[...n[0]||(n[0]=[a(`<h1 id="时间与空间复杂度" tabindex="-1"><a class="header-anchor" href="#时间与空间复杂度"><span>时间与空间复杂度</span></a></h1><h2 id="一、什么是复杂度" tabindex="-1"><a class="header-anchor" href="#一、什么是复杂度"><span>一、什么是复杂度</span></a></h2><ul><li><strong>「时间复杂度」</strong>：程序执行需要的<strong>计算量</strong></li><li><strong>「空间复杂度」</strong>：程序执行需要的<strong>内存空间</strong></li><li>复杂度是<strong>数量级</strong>（方便记忆、推广），不是具体的数字</li><li>一般针对一个<strong>具体算法</strong>，而非一个系统</li><li>常见复杂度：n2 &gt; nlogn &gt; n &gt; 根号n &gt; logn &gt; 1[ O(1) 可数的，和输入量无关，无论多少都不影响...]</li><li>前端开发：<strong>重时间</strong>、轻空间</li><li>识破<strong>内置API的时间复杂度</strong>，[数组是个连续内存空间，<strong>unshift shift splice</strong> 都比较慢O(n); push、pop比较快;slice不改变原数组时间O(1)]</li></ul><h2 id="二、时间复杂度计算示例" tabindex="-1"><a class="header-anchor" href="#二、时间复杂度计算示例"><span>二、时间复杂度计算示例</span></a></h2><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line"> // O(1)</span>
<span class="line">let i = 0</span>
<span class="line">i += 1</span>
<span class="line"></span>
<span class="line">// O(n)</span>
<span class="line">for (let i = 0; i &lt; n; i++) {</span>
<span class="line">    console.log(i)</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line"></span>
<span class="line">// O(1)+O(n)=O(n)</span>
<span class="line">let i = 0</span>
<span class="line">i += 1</span>
<span class="line">for (let i = 0; i &lt; n; i++) {</span>
<span class="line">    console.log(i)</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">// O(n)*O(n)=O(n^2)</span>
<span class="line">for (let i = 0; i &lt; n; i++) {</span>
<span class="line">    for (let i = 0; i &lt; n; i++) {</span>
<span class="line">    console.log(i,j)</span>
<span class="line">    }</span>
<span class="line">    </span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">// O(logN) 2的多少次方为n</span>
<span class="line">let i=1;</span>
<span class="line">while(i&lt;n){</span>
<span class="line">    console.log(i)</span>
<span class="line">    i*=2</span>
<span class="line">}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="三、空间复杂度计算示例" tabindex="-1"><a class="header-anchor" href="#三、空间复杂度计算示例"><span>三、空间复杂度计算示例</span></a></h2><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">// O(1)-单个变量</span>
<span class="line">let i = 0</span>
<span class="line">i += 1</span>
<span class="line"></span>
<span class="line">// O(n)- 数组有n个变量，占用了n个内存单元</span>
<span class="line">const list=[]</span>
<span class="line">for (let i = 0; i &lt; n; i++) {</span>
<span class="line">    list.push(i)</span>
<span class="line">}</span>
<span class="line"></span>
<span class="line">// O(n^2) -矩阵-二维数组，有n^2个变量</span>
<span class="line">var n=5</span>
<span class="line">const matrix=[]</span>
<span class="line">for (let i = 0; i &lt; n; i++) {</span>
<span class="line">    matrix.push([])</span>
<span class="line">    for (let j = 0; j &lt; n; j++) {</span>
<span class="line">    matrix[i].push(j)</span>
<span class="line">    }</span>
<span class="line">}</span>
<span class="line">console.log(matrix)</span>
<span class="line">// [[0, 1, 2, 3, 4]</span>
<span class="line">// [0, 1, 2, 3, 4]</span>
<span class="line">// [0, 1, 2, 3, 4]</span>
<span class="line">// [0, 1, 2, 3, 4]</span>
<span class="line">// [0, 1, 2, 3, 4]]</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,7)])])}const r=s(e,[["render",c]]),t=JSON.parse('{"path":"/fontend/class2/02.time-space-complexity.html","title":"时间与空间复杂度","lang":"zh-CN","frontmatter":{},"git":{"updatedTime":1764157357000,"contributors":[{"name":"lumi","username":"lumi","email":"lumiya1228@gmail.com","commits":1,"url":"https://github.com/lumi"}],"changelog":[{"hash":"1860e17827d3aabac151c579edaf9fdcd3a988c3","time":1764157357000,"email":"lumiya1228@gmail.com","author":"lumi","message":"docs: expand front-end class2 section with new topics on data structures and algorithms"}]},"filePathRelative":"fontend/class2/02.time-space-complexity.md"}');export{r as comp,t as data};
