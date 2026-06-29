import type { ReactNode } from "react";

interface CoverHeroProps {
  /** 封面图地址 */
  src: string;
  /** 叠加在封面之上的头部内容（标题、元信息、分类、标签等） */
  children: ReactNode;
}

/**
 * 文章详情页封面 Hero。
 *
 * 将封面作为标题区背景，头部内容叠加其上，营造图文融合的沉浸式头部。
 *
 * 可读性保障（无论封面明暗 / 站点明暗主题）：
 * - 横向主蒙版：左侧深 → 右侧透明，文字落在左侧暗区，右侧露出封面主体；
 * - 纵向辅助蒙版：底部轻压暗，兜底底部元信息行；
 * - 头部文字使用固定浅色 + 文字阴影，不随主题切换，确保对比度恒定达标；
 * - 内容限制最大宽度，停留在左侧暗区，避免延伸到右侧亮部。
 */
export function CoverHero({ src, children }: CoverHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] animate-fade-in-up">
      {/* 封面背景图（装饰性，标题已是同等文本，故 alt 置空） */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* 可读性蒙版：
          - 横向主蒙版：左侧深 → 右侧透明，文字落在左侧暗区，右侧露出封面主体；
          - 纵向辅助蒙版：底部轻压暗，兜底底部元信息行；
          固定浅色文字 + 文字阴影，确保任意封面 / 任意明暗主题下文字都清晰。 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
      />

      {/* 头部内容：底部左对齐，限制宽度以停留在左侧暗区 */}
      <div className="relative z-10 flex min-h-[clamp(180px,24vw,300px)] flex-col justify-end p-5 sm:p-6 lg:p-8">
        <div className="max-w-[42rem]">{children}</div>
      </div>
    </div>
  );
}
