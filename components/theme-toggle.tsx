"use client";

// import { useState, useRef, useEffect } from "react";
// import { createPortal } from "react-dom";
import { useTheme } from "@/components/theme-provider";

/**
 * 主题切换按钮
 * 三态切换：dark → light → system → dark
 * 使用 Portal 渲染 tooltip，避免被 header 边框裁剪
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // const [showTip, setShowTip] = useState(false);
  // const buttonRef = useRef<HTMLButtonElement>(null);
  // const [mounted, setMounted] = useState(false);
  // useEffect(() => setMounted(true), []);

  // const themeNames: Record<string, string> = {
  //   dark: "深色",
  //   light: "浅色",
  //   system: "系统",
  // };

  // const nextTheme: Record<string, string> = {
  //   dark: "浅色",
  //   light: "系统",
  //   system: "深色",
  // };

  const cycleTheme = () => {
    // if (theme === "dark") setTheme("light");
    // else if (theme === "light") setTheme("system");
    // else setTheme("dark");
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // const current = themeNames[theme ?? "system"] ?? "系统";
  // const next = nextTheme[theme ?? "system"] ?? "深色";

  return (
    <>
      <button
        // ref={buttonRef}
        onClick={cycleTheme}
        // onMouseEnter={() => setShowTip(true)}
        // onMouseLeave={() => setShowTip(false)}
        className="relative flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] 
                   bg-[var(--bg-tertiary)] hover:bg-[var(--accent-muted)] 
                   border border-[var(--border-subtle)]
                   transition-all duration-[var(--duration-fast)]
                   hover:shadow-[var(--shadow-glow-accent)]"
        aria-label={`切换主题`}
      >
        {/* 月亮图标 - Dark */}
        <svg
          className={`absolute w-4 h-4 transition-all duration-[var(--duration-normal)] ${
            theme === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-90 scale-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>

        {/* 太阳图标 - Light */}
        <svg
          className={`absolute w-4 h-4 transition-all duration-[var(--duration-normal)] ${
            theme === "light"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>

        {/* 电脑图标 - System */}
        <svg
          className={`absolute w-4 h-4 transition-all duration-[var(--duration-normal)] ${
            theme === "system"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-90 scale-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* Portal Tooltip - 渲染到 body，不受 header overflow 影响 */}
      {/* {mounted && showTip &&
        createPortal(
          <span
            className="fixed px-3 py-1.5 rounded-[var(--radius-lg)]
                       bg-[var(--bg-inverse)] text-[var(--text-inverse)]
                       text-xs font-medium whitespace-nowrap pointer-events-none
                       shadow-[var(--shadow-lg)] z-[9999]
                       animate-in fade-in duration-200
                       after:content-[''] after:absolute after:-top-full after:left-1/2 
                       after:-translate-x-1/2 after:border-[6px] after:border-transparent 
                       after:border-b-[var(--bg-inverse)]"
            style={{
              top:
                (buttonRef.current?.getBoundingClientRect().bottom ?? 0) + 10,
              left: (buttonRef.current?.getBoundingClientRect().left ?? 0) + (buttonRef.current?.offsetWidth ?? 36) / 2,
              transform: "translateX(-50%)",
            }}
          >
            {current} → {next}
          </span>,
          document.body,
        )} */}
    </>
  );
}
