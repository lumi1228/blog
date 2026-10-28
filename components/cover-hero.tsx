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
 * - 横向与纵向蒙版均使用媒体 token，随主题切换深浅关系；
 * - 图片在亮色主题提亮降饱和，在暗色主题轻压暗；
 * - 内容限制最大宽度，停留在高对比度承载区。
 * --- @ty.aicoding@ ---
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
        className="theme-media-image absolute inset-0 h-full w-full object-cover"
      />

      {/* 主题化可读性蒙版：横向承载标题，纵向兜底元信息。 */}
      <div
        aria-hidden="true"
        className="theme-media-overlay-horizontal absolute inset-0"
      />
      <div
        aria-hidden="true"
        className="theme-media-overlay-vertical absolute inset-0 opacity-35"
      />

      {/* 头部内容：底部左对齐，限制宽度以停留在左侧暗区 */}
      <div className="relative z-10 flex min-h-[clamp(180px,24vw,300px)] flex-col justify-end p-5 sm:p-6 lg:p-8">
        <div className="max-w-[42rem]">{children}</div>
      </div>
    </div>
  );
}
