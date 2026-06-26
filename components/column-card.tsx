"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

interface ColumnCardProps {
  column: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    coverImage: string | null;
  };
  locale: string;
  index?: number;
}

export function ColumnCard({ column, locale, index = 0 }: ColumnCardProps) {
  const t = useTranslations();

  return (
    <Link
      href={`/${locale}/docs/${column.slug}`}
      className="group frosted-glass relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] 
                 transition-all duration-[var(--duration-normal)]
                 hover:border-[var(--accent-primary)]/40 hover:shadow-[var(--shadow-glow-accent)]
                 animate-fade-in-up isolate"
      style={{ 
        animationDelay: `${index * 100}ms`,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* 装饰性光晕背景 - 鼠标悬停时旋转扩散 */}
      <div 
        className="absolute -inset-1 bg-gradient-to-br from-[var(--accent-primary)]/0 via-[var(--accent-primary)]/0 to-[var(--accent-primary)]/0 
                   opacity-0 blur-xl transition-all duration-700 group-hover:opacity-30 group-hover:from-[var(--accent-primary)]/20 
                   group-hover:via-[var(--accent-secondary)]/10 group-hover:to-transparent group-hover:scale-105 -z-10"
        style={{ animation: 'pulse 4s ease-in-out infinite' }}
      />
      
      {/* 顶部装饰条纹 */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-primary)]/50 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* 封面图 */}
      {column.coverImage && (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)]">
          {/* 图片容器 - 3D旋转效果 */}
          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.05]">
            <img
              src={column.coverImage}
              alt={column.title}
              className="h-full w-full object-cover"
            />
          </div>
          
          {/* 多层渐变叠加 - 增强深度 */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/95 via-[#030712]/40 to-transparent 
                          transition-opacity duration-500 group-hover:from-[#030712]/80" />
          
          {/* 光晕粒子效果 - hover时出现 */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-[var(--accent-primary)]/20 rounded-full blur-3xl 
                            animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-[var(--accent-secondary)]/15 rounded-full blur-2xl 
                            animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          </div>

          {/* 装饰性网格线 */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
               style={{
                 backgroundImage: 'linear-gradient(var(--accent-primary) 1px, transparent 1px), linear-gradient(90deg, var(--accent-primary) 1px, transparent 1px)',
                 backgroundSize: '30px 30px'
               }} 
          />
        </div>
      )}

      {/* 内容区 - 精心设计的层次结构 */}
      <div className="flex flex-1 flex-col p-6 relative">
        {/* 装饰性左侧边缘光条 */}
        <div className="absolute left-0 top-6 bottom-6 w-[2px] bg-gradient-to-b from-transparent via-[var(--accent-primary)]/0 to-transparent
                        group-hover:via-[var(--accent-primary)]/50 transition-all duration-500" />
        
        {/* 标题 - 字符级动画效果 */}
        <h3
          className="mb-3 text-xl font-bold text-[var(--text-primary)] 
                     transition-all duration-500 relative
                     group-hover:text-[var(--accent-primary)] group-hover:tracking-wide
                     group-hover:translate-x-1"
          style={{ 
            fontFamily: "var(--font-display)",
            textShadow: '0 0 20px rgba(var(--accent-primary-rgb, 59, 130, 246), 0)'
          }}
        >
          {column.title}
          {/* 标题下划线动画 */}
          <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] 
                          group-hover:w-full transition-all duration-500" />
        </h3>

        {column.description && (
          <p className="mb-5 flex-1 text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-2
                        transition-all duration-300 group-hover:text-[var(--text-primary)]/80">
            {column.description}
          </p>
        )}

        {/* 底部操作区 - 磁性悬浮按钮 */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]
                        group-hover:border-[var(--accent-primary)]/30 transition-all duration-500">
          <span className="text-xs font-semibold tracking-wider uppercase text-[var(--text-tertiary)] 
                          group-hover:text-[var(--accent-primary)] transition-all duration-300
                          group-hover:translate-x-1">
            {t("home.exploreColumn")}
          </span>
          
          {/* 增强的箭头按钮 - 3D效果 */}
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full 
                          bg-[var(--bg-primary)]/50 border border-[var(--border-subtle)] 
                          transition-all duration-500
                          group-hover:border-[var(--accent-primary)]/60 
                          group-hover:bg-[var(--accent-primary)]/15
                          group-hover:scale-110 group-hover:rotate-0 rotate-[-8deg]
                          group-hover:shadow-[0_0_20px_rgba(var(--accent-primary-rgb,59,130,246),0.3)]">
            {/* 背景脉冲效果 */}
            <div className="absolute inset-0 rounded-full bg-[var(--accent-primary)]/20 
                            opacity-0 group-hover:opacity-100 animate-ping" 
                 style={{ animationDuration: '1.5s' }} />
            
            <svg
              className="h-5 w-5 text-[var(--text-tertiary)] relative z-10
                         transition-all duration-300
                         group-hover:translate-x-1 group-hover:text-[var(--accent-primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
        
        {/* 装饰性点缀元素 - 右上角 */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-20 transition-all duration-700">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
        </div>
      </div>
      
      {/* 底部装饰条纹 */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-secondary)]/30 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Link>
  );
}
