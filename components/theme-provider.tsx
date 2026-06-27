"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { usePathname } from "next/navigation";

type Theme = "dark" | "light" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * 根据当前路由计算「默认主题」。
 * - 知识库（/docs 及其子页）默认浅色
 * - 主站所有页面（首页、文章详情页等）默认深色
 *
 * 注意：usePathname 返回的是包含 locale 前缀的原始路径（非默认语言为 /en 开头），
 * 这里先剥离 /en 前缀再判断区域。
 */
function getDefaultThemeForPath(pathname: string): "dark" | "light" {
  const path = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  if (path === "/docs" || path.startsWith("/docs/")) return "light";
  return "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const defaultTheme = getDefaultThemeForPath(pathname);

  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(
    defaultTheme
  );

  // 记录上一次所属区域的默认主题，用于检测「跨区域」切换
  const prevDefaultRef = useRef<"dark" | "light">(defaultTheme);

  // 应用主题到 DOM
  const applyTheme = useCallback((resolved: "dark" | "light") => {
    const root = document.documentElement;
    if (resolved === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    setResolvedTheme(resolved);
  }, []);

  // 获取系统主题偏好
  const getSystemTheme = useCallback((): "dark" | "light" => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }, []);

  // 设置主题（仅在当前会话生效，不持久化）
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      // 不再保存到 localStorage，刷新/跳转后恢复所属区域的默认主题

      if (newTheme === "system") {
        applyTheme(getSystemTheme());
      } else {
        applyTheme(newTheme);
      }
    },
    [applyTheme, getSystemTheme]
  );

  // 初始化：应用当前路由对应的默认主题
  useEffect(() => {
    applyTheme(defaultTheme);
    // 仅在挂载时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 路由切换：当进入的区域默认主题发生变化（如首页→知识库）时，
  // 重置为该区域的默认主题；同一区域内导航则保留用户手动切换的选择。
  useEffect(() => {
    if (prevDefaultRef.current !== defaultTheme) {
      prevDefaultRef.current = defaultTheme;
      setThemeState(defaultTheme);
      applyTheme(defaultTheme);
    }
  }, [defaultTheme, applyTheme]);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        applyTheme(e.matches ? "light" : "dark");
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme 必须在 ThemeProvider 内部使用");
  }
  return context;
}
