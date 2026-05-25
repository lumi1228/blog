import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["zh-CN", "en"],
  defaultLocale: "zh-CN",
  // 中文默认无前缀，英文带 /en 前缀
  localePrefix: {
    mode: "as-needed",
    prefixes: {
      "zh-CN": "/",
      en: "/en",
    },
  },
});

// 导出国际化导航工具
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
