"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // const [theme, setThemeState] = useState<Theme>("system");
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

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
      // 不再保存到 localStorage，刷新后恢复默认 dark 主题

      if (newTheme === "system") {
        applyTheme(getSystemTheme());
      } else {
        applyTheme(newTheme);
      }
    },
    [applyTheme, getSystemTheme]
  );

  // 初始化：始终使用默认的 dark 主题，不读取 localStorage
  useEffect(() => {
    // 每次进入页面都重置为 dark 主题
    applyTheme("dark");
  }, [applyTheme]);

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
