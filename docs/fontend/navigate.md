
<style scoped>
.fe-hero {
  margin: 28px 0 36px;
  padding: 48px 40px;
  border-radius: 30px;
  background: linear-gradient(120deg, rgba(2,6,23,.95), rgba(14,116,144,.85));
  color: #f8fafc;
  box-shadow: 0 40px 65px rgba(2,6,23,.55);
  border: 1px solid rgba(94,234,212,.35);
}
.fe-hero h2 {
  margin: 0 0 12px;
  font-size: 36px;
}
.fe-hero p {
  margin: 6px 0;
  font-size: 18px;
  line-height: 1.8;
}
.fe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(240px,1fr));
  gap: 18px;
  margin-top: 22px;
}
.fe-card {
  padding: 18px;
  border-radius: 18px;
  background: rgba(15,23,42,.7);
  border: 1px solid rgba(94,234,212,.28);
  font-size: 14px;
  line-height: 1.6;
}
.fe-card span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #5eead4;
  margin-bottom: 6px;
}
.fe-section {
  margin: 36px 0 10px;
  font-size: 22px;
  color: #14b8a6;
  position: relative;
}
.fe-section::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 80px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg,#5eead4,#38bdf8);
}
.fe-list {
  margin: 16px 0 0;
  padding-left: 18px;
  color: #e2e8f0;
  line-height: 1.8;
}
</style>

<div class="fe-hero">
  <h2>前端基础路线 · 持续更新</h2>
  <p>该模块聚焦 JavaScript 语言基础、CSS/UI 工程、项目架构模式与通用开发方案，提供由底至上的学习路径。</p>
  <p>内容按专题逐步公开，可配合面试/实战需要自由组合。</p>
  <div class="fe-grid">
    <div class="fe-card">
      <span>🧠 Core Language</span>
      JS/TS 语法、运行时、调试技巧与手写题模板。
    </div>
    <div class="fe-card">
      <span>🎨 UI & CSS</span>
      设计系统、响应式、动画与可访问性策略。
    </div>
    <div class="fe-card">
      <span>⚙️ Engineering</span>
      构建、模块化、性能优化、DevTools 组合拳。
    </div>
    <div class="fe-card">
      <span>🏗 Architecture</span>
      前端项目架构、领域建模、通用解决方案沉淀。
    </div>
  </div>
</div>
