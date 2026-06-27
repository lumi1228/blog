"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface EmailContactProps {
  label: string;
  user: string;
  domain: string;
  /** 进场动画延迟（ms），与联系区其它卡片错位一致 */
  delay?: number;
}

/**
 * 防爬邮箱卡片：邮箱地址拆成 user/domain 两段，点击后才在客户端拼接并显示，
 * 静态 HTML 中不出现完整邮箱，降低被爬虫采集的概率。
 */
export function EmailContact({ label, user, domain, delay = 0 }: EmailContactProps) {
  const t = useTranslations("about");
  const [revealed, setRevealed] = useState(false);
  const email = `${user}@${domain}`;

  const cardClass =
    "frosted-glass group relative flex w-full items-center justify-between rounded-[var(--radius-lg)] " +
    "p-6 text-left transition-all duration-[var(--duration-normal)] " +
    "hover:border-[var(--accent-primary)]/40 hover:shadow-[var(--shadow-glow-accent)] " +
    "hover:scale-[1.02] animate-fade-in-up";

  const inner = (
    <>
      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
          {label}
        </div>
        <div
          className="text-base font-medium text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-primary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {revealed ? email : t("revealEmail")}
        </div>
      </div>
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[var(--accent-primary)]
                   transition-all duration-[var(--duration-normal)]
                   group-hover:bg-[var(--accent-primary)] group-hover:text-[#030712] group-hover:scale-110 group-hover:rotate-12"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          {revealed ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          )}
        </svg>
      </div>
      <div
        className="absolute bottom-0 left-6 right-6 h-[2px] origin-left scale-x-0 transition-transform duration-[var(--duration-normal)] group-hover:scale-x-100"
        style={{ background: "linear-gradient(to right, var(--accent-primary), transparent)" }}
      />
    </>
  );

  if (revealed) {
    return (
      <a href={`mailto:${email}`} className={cardClass} style={{ animationDelay: `${delay}ms` }}>
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      aria-label={t("revealEmail")}
      className={cardClass}
      style={{ animationDelay: `${delay}ms` }}
    >
      {inner}
    </button>
  );
}
