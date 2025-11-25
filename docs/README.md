<!-- # Hello Lumi -->

<style scoped>
.hero-wrap {
  position: relative;
  border-radius: 30px;
  overflow: hidden;
  margin: 24px 0 32px;
  min-height: 380px;
  color: #fff;
  border: 1px solid rgba(139,92,246,.3);
  box-shadow: 0 20px 50px rgba(15,23,42,.6);
  animation: hero-glow 8s ease-in-out infinite alternate;
}
.hero-wrap::before,
.hero-wrap::after {
  content: '';
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139,92,246,.25), rgba(99,102,241,.2), transparent 70%);
  filter: blur(2px);
  animation: orb 12s linear infinite;
  pointer-events: none;
}
.hero-wrap::before {
  top: -60px;
  left: -30px;
}
.hero-wrap::after {
  bottom: -80px;
  right: -60px;
  animation-delay: 4s;
}
.hero-glass {
  backdrop-filter: blur(20px);
  background: rgba(15,23,42,.75);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 36px;
  align-items: start;
  padding: 48px;
  border: 1px solid rgba(139,92,246,.25);
}
.hero-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.hero-avatar {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  padding: 5px;
  background: linear-gradient(135deg, rgba(139,92,246,.95), rgba(99,102,241,.9), rgba(59,130,246,.85));
  box-shadow: 0 15px 40px rgba(139,92,246,.4), 0 0 30px rgba(99,102,241,.3);
  position: relative;
}
.hero-avatar::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(139,92,246,.5), rgba(99,102,241,.3));
  filter: blur(8px);
  z-index: -1;
  animation: avatar-glow 3s ease-in-out infinite alternate;
}
.hero-avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(15,23,42,.7);
}
.hero-quote-inline {
  max-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(15,23,42,.7);
  border: 1px solid rgba(139,92,246,.3);
  backdrop-filter: blur(8px);
}
.hero-text h1 {
  font-size: 46px;
  margin: 0 0 16px;
  background: linear-gradient(135deg, #a78bfa, #8b5cf6, #6366f1, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  letter-spacing: -0.5px;
}
.hero-text p {
  margin: 8px 0;
  font-size: 16px;
  color: rgba(226,232,240,.9);
  line-height: 1.7;
}
.hero-quote-icon {
  font-size: 32px;
  color: rgba(139,92,246,.8);
  filter: drop-shadow(0 0 8px rgba(139,92,246,.5));
}
.hero-quote {
  margin: 0;
  font-size: 14px;
  color: rgba(196,181,253,.95);
  font-style: italic;
  line-height: 1.7;
  text-align: center;
}
.cta-group {
  margin-top: 18px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.cta-group a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 999px;
  font-weight: 600;
  transition: all .25s ease;
  text-decoration: none;
}
.cta-primary {
  background: #22d3ee;
  color: #0f172a;
  box-shadow: 0 12px 30px rgba(45,212,191,.45);
}
.cta-primary:hover { transform: translateY(-2px) scale(1.01); }
.cta-secondary {
  border: 1px solid rgba(255,255,255,.45);
  color: #fff;
  backdrop-filter: blur(6px);
}
.section-title {
  font-size: 28px;
  margin: 48px 0 16px;
  position: relative;
}
.section-title::after {
  content: '';
  width: 72px;
  height: 3px;
  background: linear-gradient(90deg,#a78bfa,#8b5cf6,#6366f1);
  position: absolute;
  left: 0;
  bottom: -8px;
  border-radius: 999px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(240px,1fr));
  gap: 18px;
}
.card {
  border-radius: 18px;
  padding: 22px;
  background: rgba(15,23,42,.9);
  color: #e2e8f0;
  border: 1px solid rgba(139,92,246,.25);
  box-shadow: 0 16px 30px rgba(15,23,42,.5);
  transition: transform .35s ease, border .35s ease, box-shadow .35s ease;
  position: relative;
  overflow: hidden;
}
.card:hover {
  transform: translateY(-4px);
  border-color: rgba(139,92,246,.5);
  box-shadow: 0 22px 35px rgba(15,23,42,.6);
}
.card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(139,92,246,.15), rgba(99,102,241,.1), transparent 70%);
  opacity: 0;
  transition: opacity .35s ease;
}
.card:hover::after { opacity: 1; }
.card h3 { margin: 0 0 8px; font-size: 18px; }
.card p { margin: 0 0 12px; font-size: 14px; color: #94a3b8; }
.card a {
  color: #a78bfa;
  text-decoration: none;
  font-weight: 600;
}
.timeline {
  border-left: 3px solid rgba(139,92,246,.35);
  padding-left: 20px;
  margin-top: 16px;
  position: relative;
}
.timeline::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, rgba(139,92,246,.4), rgba(99,102,241,.5));
  animation: pulse 3s ease-in-out infinite;
}
.timeline-item {
  margin-bottom: 20px;
  position: relative;
}
.timeline-item::before {
  content: '';
  position: absolute;
  left: -28px;
  top: 4px;
  width: 14px;
  height: 14px;
  background: #8b5cf6;
  border-radius: 50%;
  box-shadow: 0 0 0 10px rgba(139,92,246,.2);
}
.cta-primary {
  background: linear-gradient(135deg, #a78bfa, #8b5cf6, #6366f1, #3b82f6);
  color: #0f172a;
  box-shadow: 0 8px 20px rgba(139,92,246,.4), 0 0 12px rgba(99,102,241,.3);
  font-weight: 700;
}
.cta-primary:hover { 
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 10px 25px rgba(139,92,246,.5), 0 0 18px rgba(99,102,241,.4);
}
.cta-secondary {
  border: 1px solid rgba(139,92,246,.4);
  color: #e2e8f0;
  backdrop-filter: blur(8px);
  background: rgba(15,23,42,.5);
}
.cta-secondary:hover { 
  border-color: rgba(139,92,246,.6);
  background: rgba(15,23,42,.7);
  color: #f1f5f9;
}

@keyframes hero-glow {
  from { box-shadow: 0 20px 50px rgba(15,23,42,.6), 0 0 20px rgba(139,92,246,.15); }
  to { box-shadow: 0 25px 60px rgba(15,23,42,.7), 0 0 30px rgba(139,92,246,.25); }
}
@keyframes avatar-glow {
  from { opacity: .4; transform: scale(1); }
  to { opacity: .8; transform: scale(1.05); }
}
@keyframes orb {
  0% { transform: translate(0,0) scale(1); opacity: .6; }
  50% { transform: translate(40px, -20px) scale(1.15); opacity: .85; }
  100% { transform: translate(0,0) scale(1); opacity: .6; }
}
@keyframes pulse {
  0% { opacity: .4; }
  50% { opacity: .9; }
  100% { opacity: .4; }
}
.timeline-item h4 { margin: 0 0 6px; }
.timeline-item span {
  color: #94a3b8;
  font-size: 14px;
}
@media (max-width: 768px) {
  .hero-glass { 
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 32px;
  }
  .hero-profile {
    align-items: center;
  }
  .hero-avatar { width: 140px; height: 140px; }
  .hero-text h1 { font-size: 36px; }
  .hero-quote-inline { max-width: 100%; }
}
@media (max-width: 640px) {
  .hero-glass { padding: 24px; }
  .hero-avatar { width: 120px; height: 120px; }
  .hero-text h1 { font-size: 32px; }
}
</style>

<div class="hero-wrap" :style="heroStyle">
  <div class="hero-glass">
    <div class="hero-profile">
      <div class="hero-avatar">
        <img class="hero-avatar-inner" :src="heroAvatar" alt="Lumi avatar" />
      </div>
      <div class="hero-quote-inline">
        <span class="hero-quote-icon">❝</span>
        <p class="hero-quote">{{ heroQuote }}</p>
      </div>
    </div>
    <div class="hero-text">
      <h1>Hi, I'm Lumi 👋</h1>
      <p>聚焦前端进阶 · 全栈思维 · 长期主义的工程实践者</p>
      <p>记录学习路径、架构经验与工程化最佳实践，和你一起打磨前端竞争力。</p>
      <div class="cta-group">
        <a class="cta-primary" href="./fullstack/README.html">进入全栈宇宙</a>
        <a class="cta-secondary" href="https://github.com/lumi1228" target="_blank">GitHub 社区</a>
      </div>
    </div>
  </div>
</div>

## 🌌 能力地图

<div class="grid">
  <div class="card">
    <h3>全栈总览</h3>
    <p>构建宏观认知，理解行业趋势与全栈成长路径。</p>
    <a href="./fullstack/class1/01.meet-fullstack.html">前往阅读 →</a>
  </div>
  <div class="card">
    <h3>工程化工具</h3>
    <p>Webpack / Gulp / Yeoman / Koa 等工具链打法与落地。</p>
    <a href="./fullstack/class2/03.tool-webpack.html">实战指南 →</a>
  </div>
  <div class="card">
    <h3>DevOps 全流程</h3>
    <p>需求、协作、交付、运维，打造端到端的前端生产力。</p>
    <a href="./fullstack/class3/02.project-require.html">流程洞察 →</a>
  </div>
  <div class="card">
    <h3>Offer 辅导</h3>
    <p>覆盖面试知识图谱、题型拆解与答题策略。</p>
    <a href="./offer/README.html">面试目录 →</a>
  </div>
</div>

## 🔭 Roadmap

<div class="timeline">
  <div class="timeline-item">
    <h4>Q1 · 架构基线</h4>
    <span>完善全栈总览、补齐工程化与 DevOps 体系</span>
  </div>
  <div class="timeline-item">
    <h4>Q2 · 面试实战营</h4>
    <span>开放前端面试题库、案例拆解与模拟演练</span>
  </div>
  <div class="timeline-item">
    <h4>Q3 · 云原生加速</h4>
    <span>引入 Serverless / BFF / Observability 等高级主题</span>
  </div>
  <div class="timeline-item">
    <h4>Q4 · 开源共建</h4>
    <span>发布实践项目与工具库，邀请社区共创</span>
  </div>
</div>

## ⚡ 快速入口

- [全栈进阶首页](./fullstack/README.md)
- [前端困境与全栈破局](./fullstack/class1/01.meet-fullstack.md)
- [打包工具之 webpack](./fullstack/class2/03.tool-webpack.md)
- [自动化工具之 gulp](./fullstack/class2/04.tool-gulp.md)
- [脚手架生成器之 Yeoman](./fullstack/class2/05.tool-yeoman.md)
- [Koa Web 框架](./fullstack/class2/06.koa-framework.md)
- [项目需求分析与工具](./fullstack/class3/02.project-require.md)

<script setup>
import { computed, ref, onMounted } from 'vue'

const heroImages = [
  // docs/.vuepress/public/images/lumi/*
  '/blog/images/lumi/lumi1.jpg',
  '/blog/images/lumi/lumi2.jpg',
  '/blog/images/lumi/lumi3.jpg',
  '/blog/images/lumi/lumi4.jpg',
]

const quotes = [
  'Stay curious, ship boldly, iterate fast.',
  '代码是桥梁，连接想象与现实。',
  'Keep learning, keep sharing, keep building.',
  '用工程思维解决问题，用作品表达自我。',
  'Great interfaces begin with empathy for users.',
  '写代码先写思路，画架构先画边界。',
  'Every deploy is a conversation with your future self.',
  '速度与质量并存，架构与体验齐飞。',
  'Embrace constraints—they inspire smarter solutions.',
  '全栈不是负担，而是理解协作的钥匙。',
  'Build systems that outlive individual contributors.',
  '测试是对代码最真诚的告白。',
  '自动化让热情投入到更有创造力的地方。',
  '可观测性是工程信仰的一部分。',
  '不断复盘，才能让经验变得可迁移。',
  '抽象是为了解决复杂度，而非隐藏复杂度。',
  '文档是产品的一部分，而不是附属品。',
  '前端不仅是像素，更是产品策略的展现。',
  '不要害怕重构，害怕停留在旧观念里。',
  'Write it down, learn out loud, grow together.'
]

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)]

const heroImage = ref(heroImages[0])
const heroAvatar = ref(heroImages[0])
const heroQuote = ref(quotes[0])

const initRandom = () => {
  const pickedImage = pickRandom(heroImages)
  heroImage.value = pickedImage
  heroAvatar.value = pickedImage
  heroQuote.value = pickRandom(quotes)
}

if (typeof window !== 'undefined') {
  initRandom()
}

onMounted(() => {
  initRandom()
})

const heroStyle = computed(() => ({
  background: `linear-gradient(180deg, rgba(55,48,163,.7), rgba(30,27,75,.75), rgba(15,23,42,.85)), url(${heroImage.value}) center/cover`
}))
</script>