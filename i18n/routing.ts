import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["zh-CN", "en"],
  defaultLocale: "zh-CN",
  // 默认语言无前缀，非默认语言带前缀
  localePrefix: "as-needed",
});

// 导出国际化导航工具
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
