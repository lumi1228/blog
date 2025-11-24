# Hello Lumi

<style scoped>
.hero-wrap {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  margin: 24px 0 32px;
  min-height: 320px;
  color: #fff;
  background: linear-gradient(135deg, rgba(17,24,39,.85), rgba(59,7,100,.8)),
    url(/images/lumi1.jpg) center/cover;
  box-shadow: 0 20px 45px rgba(15,23,42,.35);
}
.hero-glass {
  backdrop-filter: blur(16px);
  background: rgba(15,23,42,.55);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 48px;
  gap: 40px;
}
.hero-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid rgba(255,255,255,.4);
  object-fit: cover;
  box-shadow: 0 10px 25px rgba(0,0,0,.35);
}
.hero-text h1 {
  font-size: 42px;
  margin: 0 0 12px;
}
.hero-text p {
  margin: 6px 0;
  font-size: 16px;
  opacity: .9;
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
  background: linear-gradient(90deg,#22d3ee,#2563eb);
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
  border-radius: 16px;
  padding: 20px;
  background: #0f172a;
  color: #e2e8f0;
  border: 1px solid rgba(148,163,184,.2);
  box-shadow: 0 16px 30px rgba(15,23,42,.25);
  transition: transform .25s ease, border .25s ease;
}
.card:hover {
  transform: translateY(-4px);
  border-color: rgba(56,189,248,.6);
}
.card h3 { margin: 0 0 8px; font-size: 18px; }
.card p { margin: 0 0 12px; font-size: 14px; color: #94a3b8; }
.card a {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 600;
}
.timeline {
  border-left: 3px solid rgba(14,165,233,.4);
  padding-left: 20px;
  margin-top: 16px;
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
  width: 12px;
  height: 12px;
  background: #22d3ee;
  border-radius: 50%;
  box-shadow: 0 0 0 6px rgba(34,211,238,.2);
}
.timeline-item h4 { margin: 0 0 6px; }
.timeline-item span {
  color: #94a3b8;
  font-size: 14px;
}
@media (max-width: 640px) {
  .hero-glass { padding: 28px; }
  .hero-avatar { width: 110px; height: 110px; }
  .hero-text h1 { font-size: 32px; }
}
</style>

<div class="hero-wrap">
  <div class="hero-glass">
    <img class="hero-avatar" src="/images/lumi1.jpg" alt="Lumi avatar" />
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