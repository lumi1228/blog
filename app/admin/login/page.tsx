"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("账号或密码有误");
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      {/* 主题切换（右上角） */}
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
          style={{ background: "var(--glow-primary)" }}
        />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1
            className="mb-2 text-3xl font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-[var(--accent-primary)]">L</span>umi
          </h1>
          <p className="text-sm text-[var(--text-tertiary)]">管理后台登录</p>
        </div>

        {/* 登录表单 */}
        <form
          onSubmit={handleLogin}
          className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 shadow-[var(--shadow-lg)]"
        >
          {/* 错误提示 */}
          {error && (
            <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-2.5 text-sm text-[var(--error)]">
              {error}
            </div>
          )}

          {/* 邮箱 */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
            >
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@example.com"
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] 
                         bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)]
                         placeholder:text-[var(--text-tertiary)]
                         transition-colors duration-[var(--duration-fast)]
                         focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            />
          </div>

          {/* 密码 */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
            >
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] 
                         bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)]
                         placeholder:text-[var(--text-tertiary)]
                         transition-colors duration-[var(--duration-fast)]
                         focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            />
          </div>

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2.5 
                       text-sm font-medium text-[var(--bg-primary)]
                       transition-all duration-[var(--duration-fast)]
                       hover:shadow-[var(--shadow-glow-accent)]
                       disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        {/* 底部提示 */}
        <p className="mt-4 text-center text-xs text-[var(--text-tertiary)]">
          仅限管理员登录
        </p>
      </div>
    </div>
  );
}
