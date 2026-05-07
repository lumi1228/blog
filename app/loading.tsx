/**
 * 全局加载状态
 * App Router 会在 Server Component 加载时自动显示
 */
export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="flex items-center gap-3">
        <div
          className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent-primary)]"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent-primary)]"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent-primary)]"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
