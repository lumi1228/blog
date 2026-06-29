"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isDocsUnlockedClient } from "@/lib/docs-unlock-client";
import { DocsGateModal } from "@/components/docs/docs-gate-modal";

interface DocsGateLinkProps {
  /** 目标路径（含 locale 前缀，如 /zh-CN/docs/xxx） */
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * 知识库入口链接：站内点击时就地校验门禁，避免跳转独立解锁页。
 *
 * - 已解锁（存在 UI 标记 cookie）→ 正常导航（中间件凭签名凭证放行）。
 * - 未解锁 → 阻止默认跳转，弹出门禁弹框；校验通过后 router.push 进入目标。
 *
 * 注：直接访问 /docs URL（书签/外链/新标签）不经过此组件，由中间件兜底重定向。
 */
export function DocsGateLink({
  href,
  className,
  style,
  children,
}: DocsGateLinkProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 已解锁直接放行默认导航
    if (isDocsUnlockedClient()) return;
    // 未解锁：拦截并弹框
    e.preventDefault();
    setOpen(true);
  };

  return (
    <>
      <Link href={href} className={className} style={style} onClick={handleClick}>
        {children}
      </Link>
      {open && (
        <DocsGateModal
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            router.push(href);
          }}
        />
      )}
    </>
  );
}
